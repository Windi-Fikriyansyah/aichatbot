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
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const baileys_service_1 = require("../baileys/baileys.service");
let OnboardingService = class OnboardingService {
    prisma;
    baileys;
    constructor(prisma, baileys) {
        this.prisma = prisma;
        this.baileys = baileys;
    }
    async startOnboarding(userId, data) {
        const business = await this.prisma.businessAccount.create({
            data: {
                name: data.name,
                slug: data.slug || `biz-${Date.now()}`,
                category: data.category,
                operatingHours: data.operatingHours,
                escalationPhone: data.escalationPhone,
                members: {
                    create: {
                        userId: userId,
                        role: 'OWNER'
                    }
                }
            }
        });
        return business;
    }
    async getStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { memberships: { include: { businessAccount: true } } }
        });
        return user;
    }
    async createWaSession(tenantId) {
        const sessionId = `sess-${tenantId}`;
        await this.prisma.waSession.upsert({
            where: { sessionId },
            update: {},
            create: {
                businessAccountId: tenantId,
                sessionId,
            }
        });
        await this.baileys.initSession(tenantId, sessionId);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const session = await this.prisma.waSession.findUnique({
            where: { sessionId }
        });
        return session;
    }
    async completeOnboarding(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { onboarded: true }
        });
    }
    async saveAiConfig(tenantId, data) {
        const provider = data.provider || (data.model?.split('/')[0]) || 'openrouter';
        const model = data.model || 'anthropic/claude-3.5-sonnet';
        return this.prisma.aiConfig.upsert({
            where: { businessAccountId: tenantId },
            update: {
                provider,
                model,
                customSystemPrompt: data.customSystemPrompt,
                language: data.language || 'id',
            },
            create: {
                businessAccountId: tenantId,
                provider,
                model,
                customSystemPrompt: data.customSystemPrompt,
                language: data.language || 'id',
            }
        });
    }
    async addCatalog(tenantId, data) {
        return this.prisma.product.create({
            data: {
                businessAccountId: tenantId,
                name: data.name,
                description: data.description,
                price: data.price ? parseFloat(data.price) : null,
            }
        });
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        baileys_service_1.BaileysService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map