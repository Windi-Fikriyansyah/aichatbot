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
var BaileysListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaileysListener = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const chat_gateway_1 = require("../../gateway/chat/chat.gateway");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let BaileysListener = BaileysListener_1 = class BaileysListener {
    prisma;
    chatGateway;
    processQueue;
    logger = new common_1.Logger(BaileysListener_1.name);
    constructor(prisma, chatGateway, processQueue) {
        this.prisma = prisma;
        this.chatGateway = chatGateway;
        this.processQueue = processQueue;
    }
    bindEvents(sock, businessAccountId, sessionId) {
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                await this.prisma.waSession.upsert({
                    where: { sessionId },
                    update: { qrCode: qr, status: 'SCAN_QR_NEEDED' },
                    create: { sessionId, businessAccountId, qrCode: qr, status: 'SCAN_QR_NEEDED' }
                });
                this.chatGateway.emitQrCode(businessAccountId, qr);
            }
            if (connection === 'open') {
                const phoneNumber = sock.user?.id.split(':')[0];
                await this.prisma.waSession.upsert({
                    where: { sessionId },
                    update: { status: 'CONNECTED', qrCode: null, phoneNumber },
                    create: { sessionId, businessAccountId, status: 'CONNECTED', qrCode: null, phoneNumber }
                });
                this.chatGateway.emitSessionStatus(businessAccountId, 'CONNECTED');
                this.logger.log(`Session CONNECTED for ${businessAccountId}`);
            }
        });
        sock.ev.on('messages.upsert', async (m) => {
            if (m.type === 'notify') {
                for (const msg of m.messages) {
                    if (!msg.key.fromMe) {
                        const senderPhone = msg.key.remoteJid?.split('@')[0];
                        const senderName = msg.pushName || senderPhone;
                        const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                        const waMessageId = msg.key.id;
                        if (content && senderPhone) {
                            this.logger.log(`Inbound text message received from ${senderPhone} for ${businessAccountId}`);
                            await this.processQueue.add('process-message', {
                                businessAccountId,
                                sessionId,
                                senderPhone,
                                senderName,
                                content,
                                waMessageId
                            });
                        }
                    }
                }
            }
        });
    }
};
exports.BaileysListener = BaileysListener;
exports.BaileysListener = BaileysListener = BaileysListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('process-wa-message')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway,
        bullmq_2.Queue])
], BaileysListener);
//# sourceMappingURL=baileys.listener.js.map