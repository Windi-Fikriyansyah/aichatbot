"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessageProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const bullmq_3 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const openrouter_service_1 = require("../openrouter/openrouter.service");
const chat_gateway_1 = require("../../gateway/chat/chat.gateway");
const baileys_service_1 = require("../baileys/baileys.service");
let MessageProcessor = MessageProcessor_1 = class MessageProcessor extends bullmq_1.WorkerHost {
    prisma;
    openRouter;
    chatGateway;
    replyQueue;
    baileys;
    logger = new common_1.Logger(MessageProcessor_1.name);
    constructor(prisma, openRouter, chatGateway, replyQueue, baileys) {
        super();
        this.prisma = prisma;
        this.openRouter = openRouter;
        this.chatGateway = chatGateway;
        this.replyQueue = replyQueue;
        this.baileys = baileys;
    }
    async process(job) {
        const { businessAccountId, waMessageId, sessionId, senderPhone, content, senderName } = job.data;
        try {
            const waSession = await this.prisma.waSession.findUnique({
                where: { sessionId }
            });
            if (!waSession) {
                this.logger.error(`WaSession not found for sessionId: ${sessionId}`);
                return { success: false, reason: 'wa_session_not_found' };
            }
            let conv = await this.prisma.conversation.findFirst({
                where: { waSessionId: waSession.id, customerPhone: senderPhone }
            });
            if (conv) {
                conv = await this.prisma.conversation.update({
                    where: { id: conv.id },
                    data: { customerName: senderName, lastMessageAt: new Date() }
                });
            }
            else {
                const owner = await this.prisma.tenantMember.findFirst({
                    where: { businessAccountId, role: 'OWNER' }
                });
                if (owner) {
                    const sub = await this.prisma.subscription.findUnique({ where: { userId: owner.userId } });
                    if (sub && sub.convUsed >= sub.convLimit) {
                        this.logger.warn(`Tenant ${businessAccountId} reached conversation limit.`);
                        return { success: false, reason: 'limit_reached' };
                    }
                    if (sub) {
                        await this.prisma.subscription.update({
                            where: { id: sub.id },
                            data: { convUsed: { increment: 1 } }
                        });
                    }
                }
                conv = await this.prisma.conversation.create({
                    data: {
                        businessAccountId,
                        waSessionId: waSession.id,
                        customerPhone: senderPhone,
                        customerName: senderName,
                    }
                });
            }
            const convId = conv.id;
            if (conv.status === 'RESOLVED') {
                conv = await this.prisma.conversation.update({
                    where: { id: conv.id },
                    data: { status: 'AI_HANDLING' }
                });
                this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('status-update', {
                    conversationId: conv.id,
                    status: 'AI_HANDLING'
                });
            }
            const newMessage = await this.prisma.message.create({
                data: {
                    conversationId: convId,
                    role: 'CUSTOMER',
                    content: content,
                    waMessageId,
                }
            });
            this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('new-message', newMessage);
            if (conv.status !== 'AI_HANDLING') {
                this.logger.log(`Skipping AI for conv ${convId} - status: ${conv.status}`);
                return { success: true, message: 'AI Skipped due to status: ' + conv.status };
            }
            this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('ai-status', { status: 'AI is thinking...', senderPhone });
            this.logger.log(`[DEBUG] Building AI context for conv ${convId}...`);
            const aiConfig = await this.prisma.aiConfig.findUnique({
                where: { businessAccountId },
                include: { businessAccount: true }
            });
            if (!aiConfig) {
                this.logger.warn(`[DEBUG] No AI config found for tenant ${businessAccountId}. Using defaults.`);
            }
            else {
                this.logger.log(`[DEBUG] AI Config found - model: ${aiConfig.model}, provider: ${aiConfig.provider}`);
            }
            const products = await this.prisma.product.findMany({
                where: { businessAccountId }
            });
            const history = await this.prisma.message.findMany({
                where: { conversationId: convId },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
            const bizName = aiConfig?.businessAccount?.name || 'Bisnis';
            const tone = aiConfig?.tone || 'friendly';
            const lang = aiConfig?.language || 'id';
            const defaultPrompt = `Anda adalah admin online untuk {{nama_bisnis}}, seorang sales representative yang ramah, cekatan, dan berpengalaman closing lewat WhatsApp.
Gunakan bahasa {{bahasa}} dengan gaya komunikasi {{gaya_bahasa}}, natural seperti manusia asli — BUKAN seperti robot/FAQ bot.

PERAN & TUJUAN UTAMA:
- Tujuan Anda bukan cuma menjawab pertanyaan, tapi mengarahkan pembeli sampai transaksi/closing.
- Selalu proaktif: setelah menjawab, arahkan ke langkah berikutnya (mis. tanya ukuran/warna, tawarkan checkout, minta alamat, dsb).
- Kalau customer terlihat ragu atau baru tanya-tanya, gali kebutuhannya dengan 1 pertanyaan singkat, jangan cuma jawab lalu diam.

TEKNIK CLOSING:
- Ciptakan urgensi secara jujur bila relevan (stok terbatas, promo mau habis) — jangan mengarang informasi yang tidak ada di data.
- Saat customer keberatan soal harga/pengiriman/dll, jangan langsung setuju atau menyerah — jelaskan value/manfaat produk dengan singkat, lalu tawarkan solusi (opsi cicilan, produk alternatif, promo).
- Gunakan pertanyaan tertutup untuk mempercepat keputusan, contoh: "Mau saya siapkan yang warna hitam atau putih, kak?" bukan "Ada yang bisa dibantu lagi?"
- Setelah customer setuju/tertarik, langsung arahkan ke langkah checkout/pembayaran sesuai Alur Pemesanan di bawah.

ATURAN FORMAT PESAN (WhatsApp):
- Balasan singkat, padat, maksimal 3-5 kalimat per pesan kecuali diminta detail.
- Boleh pakai emoji secukupnya agar terasa hangat, jangan berlebihan.
- Hindari format markdown seperti #, **, bullet formal — tulis seperti chat biasa.

BATASAN & KEJUJURAN (WAJIB):
- JANGAN PERNAH mengarang harga, stok, nama produk, atau kebijakan yang tidak ada di data di bawah ini.
- Jika informasi tidak tersedia di data, katakan akan dicek/dikonfirmasi oleh admin, jangan menebak.
- Jika pertanyaan di luar topik bisnis atau termasuk PANTANGAN, alihkan dengan sopan tanpa membahasnya.
`;
            let systemPrompt = aiConfig?.baseSystemPrompt
                ? aiConfig.baseSystemPrompt
                    .replace(/\{\{nama_bisnis\}\}/g, bizName)
                    .replace(/\{\{bahasa\}\}/g, lang)
                    .replace(/\{\{gaya_bahasa\}\}/g, tone)
                : defaultPrompt;
            if (aiConfig?.knowledgeBase)
                systemPrompt += `\nKnowledge Base (Informasi & Kriteria Bisnis):\n${aiConfig.knowledgeBase}\n`;
            if (products.length > 0) {
                systemPrompt += `\nKatalog Produk Aktif (HANYA gunakan data ini, jangan menambah info lain):\n${products
                    .map(p => `- ${p.name}: Rp${Number(p.price || 0).toLocaleString('id-ID')} (Stok: ${p.stock || 0}) - ${p.description || ''}`)
                    .join('\n')}\n`;
            }
            const formattedHistory = history.reverse().map(m => ({
                role: (m.role === 'CUSTOMER' ? 'user' : 'assistant'),
                content: m.content
            }));
            formattedHistory.pop();
            this.logger.log(`[DEBUG] Calling OpenRouter API with model: ${aiConfig?.model || 'anthropic/claude-3.5-sonnet'}...`);
            try {
                const jid = senderPhone.includes('@') ? senderPhone : `${senderPhone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
                await this.baileys.sendPresenceUpdate(sessionId, 'composing', jid);
            }
            catch (e) {
                this.logger.warn(`Failed to send composing status: ${e}`);
            }
            const aiResponse = await this.openRouter.generateReply({
                model: aiConfig?.model || 'anthropic/claude-3.5-sonnet',
                temperature: aiConfig?.temperature || 0.7,
                systemPrompt,
                history: formattedHistory,
                userMessage: content,
            });
            this.logger.log(`[DEBUG] AI response received: ${aiResponse.reply.substring(0, 100)}... (${aiResponse.tokensUsed} tokens, ${aiResponse.latencyMs}ms)`);
            await this.replyQueue.add('send-reply', {
                businessAccountId,
                sessionId,
                toPhone: senderPhone,
                content: aiResponse.reply,
                tokensUsed: aiResponse.tokensUsed,
                latencyMs: aiResponse.latencyMs,
                convId,
                modelUsed: aiConfig?.model || 'anthropic/claude-3.5-sonnet'
            });
            this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('ai-status', { status: 'AI finished typing', senderPhone });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to process message: ${error.message}`);
            this.logger.error(`[DEBUG] Full error stack: ${error.stack}`);
            this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('ai-status', { status: 'Error generating reply', senderPhone });
            throw error;
        }
    }
};
exports.MessageProcessor = MessageProcessor;
exports.MessageProcessor = MessageProcessor = MessageProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('process-wa-message'),
    __param(3, (0, bullmq_3.InjectQueue)('send-wa-reply')),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => baileys_service_1.BaileysService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        openrouter_service_1.OpenRouterService,
        chat_gateway_1.ChatGateway,
        bullmq_2.Queue,
        baileys_service_1.BaileysService])
], MessageProcessor);
//# sourceMappingURL=message.processor.js.map