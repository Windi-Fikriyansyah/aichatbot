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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const baileys_service_1 = require("../baileys/baileys.service");
const chat_gateway_1 = require("../../gateway/chat/chat.gateway");
let ChatViewerService = class ChatViewerService {
    prisma;
    baileys;
    chatGateway;
    constructor(prisma, baileys, chatGateway) {
        this.prisma = prisma;
        this.baileys = baileys;
        this.chatGateway = chatGateway;
    }
    async getConversations(businessAccountId) {
        return this.prisma.conversation.findMany({
            where: { businessAccountId },
            orderBy: { lastMessageAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
    }
    async getMessages(businessAccountId, conversationId) {
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId, businessAccountId }
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });
    }
    async updateConversationStatus(businessAccountId, conversationId, status) {
        const conv = await this.prisma.conversation.update({
            where: { id: conversationId, businessAccountId },
            data: { status }
        });
        this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('status-update', {
            conversationId,
            status
        });
        return conv;
    }
    async replyToConversation(businessAccountId, conversationId, content, mediaUrl) {
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId, businessAccountId }
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        let waMsgId;
        if (mediaUrl) {
            waMsgId = await this.baileys.sendMediaMessage(conv.waSessionId, conv.customerPhone, mediaUrl, content);
        }
        else {
            waMsgId = await this.baileys.sendMessage(conv.waSessionId, conv.customerPhone, content);
        }
        const newMessage = await this.prisma.message.create({
            data: {
                conversationId: conv.id,
                role: 'HUMAN_AGENT',
                content: content || (mediaUrl ? '[Media]' : ''),
                mediaUrl: mediaUrl || null,
                waMessageId: waMsgId || null,
            }
        });
        this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('new-message', newMessage);
        return newMessage;
    }
};
exports.ChatViewerService = ChatViewerService;
exports.ChatViewerService = ChatViewerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        baileys_service_1.BaileysService,
        chat_gateway_1.ChatGateway])
], ChatViewerService);
//# sourceMappingURL=chat-viewer.service.js.map