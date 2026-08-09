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
var ReplyProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const baileys_service_1 = require("../baileys/baileys.service");
const chat_gateway_1 = require("../../gateway/chat/chat.gateway");
let ReplyProcessor = ReplyProcessor_1 = class ReplyProcessor extends bullmq_1.WorkerHost {
    prisma;
    chatGateway;
    baileys;
    logger = new common_1.Logger(ReplyProcessor_1.name);
    constructor(prisma, chatGateway, baileys) {
        super();
        this.prisma = prisma;
        this.chatGateway = chatGateway;
        this.baileys = baileys;
    }
    async process(job) {
        const { businessAccountId, sessionId, toPhone, content, tokensUsed, latencyMs, convId, modelUsed } = job.data;
        try {
            const waMsgId = await this.baileys.sendMessage(sessionId, toPhone, content);
            const newMessage = await this.prisma.message.create({
                data: {
                    conversationId: convId || `${sessionId}-${toPhone}`,
                    role: 'AI',
                    content: content,
                    waMessageId: waMsgId || null,
                    tokensUsed,
                    latencyMs,
                    modelUsed
                }
            });
            this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('new-message', newMessage);
            this.logger.log(`Reply sent to ${toPhone}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to send reply: ${error.message}`);
            throw error;
        }
    }
};
exports.ReplyProcessor = ReplyProcessor;
exports.ReplyProcessor = ReplyProcessor = ReplyProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('send-wa-reply'),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => baileys_service_1.BaileysService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway,
        baileys_service_1.BaileysService])
], ReplyProcessor);
//# sourceMappingURL=reply.processor.js.map