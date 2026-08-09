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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(businessAccountId) {
        return this.prisma.businessAccount.findUnique({
            where: { id: businessAccountId }
        });
    }
    async updateProfile(businessAccountId, data) {
        return this.prisma.businessAccount.update({
            where: { id: businessAccountId },
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                escalationPhone: data.escalationPhone
            }
        });
    }
    async getAiConfig(businessAccountId) {
        return this.prisma.aiConfig.findUnique({
            where: { businessAccountId }
        });
    }
    async updateAiConfig(businessAccountId, data) {
        return this.prisma.aiConfig.update({
            where: { businessAccountId },
            data: {
                provider: data.provider,
                model: data.model,
                temperature: data.temperature,
                tone: data.tone,
                language: data.language,
                customSystemPrompt: data.customSystemPrompt,
                escalationKeywords: data.escalationKeywords,
                businessDescription: data.businessDescription,
                catalogRules: data.catalogRules,
                faqManual: data.faqManual,
                orderFlow: data.orderFlow,
                paymentShippingInfo: data.paymentShippingInfo,
                operationalHoursInfo: data.operationalHoursInfo,
                locationCodInfo: data.locationCodInfo,
                activePromoInfo: data.activePromoInfo,
                forbiddenTopics: data.forbiddenTopics,
            }
        });
    }
    async getWaSession(businessAccountId) {
        return this.prisma.waSession.findFirst({
            where: { businessAccountId }
        });
    }
    async createWaSession(businessAccountId) {
        const sessionId = `sess-${businessAccountId}`;
        return this.prisma.waSession.upsert({
            where: { sessionId },
            update: {},
            create: {
                businessAccountId,
                sessionId,
            }
        });
    }
    async disconnectWaSession(sessionId) {
        return this.prisma.waSession.update({
            where: { sessionId },
            data: { status: 'DISCONNECTED', qrCode: null, phoneNumber: null },
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map