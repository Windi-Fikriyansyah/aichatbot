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
let MessageProcessor = MessageProcessor_1 = class MessageProcessor extends bullmq_1.WorkerHost {
    prisma;
    openRouter;
    chatGateway;
    replyQueue;
    logger = new common_1.Logger(MessageProcessor_1.name);
    constructor(prisma, openRouter, chatGateway, replyQueue) {
        super();
        this.prisma = prisma;
        this.openRouter = openRouter;
        this.chatGateway = chatGateway;
        this.replyQueue = replyQueue;
    }
    async process(job) {
        const { businessAccountId, waMessageId, sessionId, senderPhone, content, senderName } = job.data;
        this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('ai-status', { status: 'AI is thinking...', senderPhone });
        try {
            let conv = await this.prisma.conversation.findFirst({
                where: { waSessionId: sessionId, customerPhone: senderPhone }
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
                        waSessionId: sessionId,
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
                return { success: true, message: 'AI Skipped due to status: ' + conv.status };
            }
            const aiConfig = await this.prisma.aiConfig.findUnique({
                where: { businessAccountId },
                include: { businessAccount: true }
            });
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
            let systemPrompt = `Anda adalah asisten virtual resmi untuk ${bizName}. Gunakan bahasa ${lang} dengan nada ${tone}.\n`;
            if (aiConfig?.customSystemPrompt)
                systemPrompt += `\nInstruksi Utama:\n${aiConfig.customSystemPrompt}\n`;
            if (aiConfig?.businessDescription)
                systemPrompt += `\nDeskripsi Bisnis:\n${aiConfig.businessDescription}\n`;
            if (aiConfig?.catalogRules)
                systemPrompt += `\nAturan Katalog:\n${aiConfig.catalogRules}\n`;
            if (products.length > 0) {
                systemPrompt += `\nKatalog Produk Aktif:\n${products.map(p => `- ${p.name}: Rp${p.price} (Stok: ${p.stock}) - ${p.description}`).join('\n')}\n`;
            }
            if (aiConfig?.faqManual)
                systemPrompt += `\nFAQ / Pertanyaan Umum:\n${aiConfig.faqManual}\n`;
            if (aiConfig?.orderFlow)
                systemPrompt += `\nAlur Pemesanan:\n${aiConfig.orderFlow}\n`;
            if (aiConfig?.paymentShippingInfo)
                systemPrompt += `\nInfo Pembayaran & Pengiriman:\n${aiConfig.paymentShippingInfo}\n`;
            if (aiConfig?.operationalHoursInfo)
                systemPrompt += `\nJam Operasional:\n${aiConfig.operationalHoursInfo}\n`;
            if (aiConfig?.locationCodInfo)
                systemPrompt += `\nLokasi & Info COD:\n${aiConfig.locationCodInfo}\n`;
            if (aiConfig?.activePromoInfo)
                systemPrompt += `\nPromo Aktif:\n${aiConfig.activePromoInfo}\n`;
            if (aiConfig?.forbiddenTopics)
                systemPrompt += `\nPANTANGAN (JANGAN BAHAS INI):\n${aiConfig.forbiddenTopics}\n`;
            const formattedHistory = history.reverse().map(m => ({
                role: (m.role === 'CUSTOMER' ? 'user' : 'assistant'),
                content: m.content
            }));
            formattedHistory.pop();
            const aiResponse = await this.openRouter.generateReply({
                model: aiConfig?.model || 'anthropic/claude-3.5-sonnet',
                temperature: aiConfig?.temperature || 0.7,
                systemPrompt,
                history: formattedHistory,
                userMessage: content,
            });
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
            this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('ai-status', { status: 'Error generating reply', senderPhone });
            throw error;
        }
    }
};
exports.MessageProcessor = MessageProcessor;
exports.MessageProcessor = MessageProcessor = MessageProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('process-wa-message'),
    __param(3, (0, bullmq_3.InjectQueue)('send-wa-reply')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        openrouter_service_1.OpenRouterService,
        chat_gateway_1.ChatGateway,
        bullmq_2.Queue])
], MessageProcessor);
//# sourceMappingURL=message.processor.js.map