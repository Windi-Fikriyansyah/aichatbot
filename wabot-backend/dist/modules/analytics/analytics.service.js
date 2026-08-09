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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(businessAccountId) {
        const totalConversations = await this.prisma.conversation.count({
            where: { businessAccountId }
        });
        const productsCount = await this.prisma.product.count({
            where: { businessAccountId }
        });
        const tokensAgg = await this.prisma.message.aggregate({
            where: { conversation: { businessAccountId }, role: 'AI' },
            _sum: { tokensUsed: true }
        });
        const activeConversations = await this.prisma.conversation.count({
            where: { businessAccountId, status: 'AI_HANDLING' }
        });
        const humanHandlingConversations = await this.prisma.conversation.count({
            where: { businessAccountId, status: { in: ['HUMAN_HANDLING', 'NEEDS_HUMAN'] } }
        });
        const ownerMember = await this.prisma.tenantMember.findFirst({
            where: { businessAccountId, role: 'OWNER' }
        });
        let subscription = null;
        if (ownerMember) {
            subscription = await this.prisma.subscription.findFirst({
                where: { userId: ownerMember.userId, status: 'ACTIVE' }
            });
        }
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);
            const count = await this.prisma.conversation.count({
                where: {
                    businessAccountId,
                    createdAt: {
                        gte: d,
                        lt: nextDay
                    }
                }
            });
            chartData.push({
                date: d.toLocaleDateString('id-ID', { weekday: 'short' }),
                chat: count
            });
        }
        return {
            totalConversations,
            activeConversations,
            humanHandlingConversations,
            productsCount,
            tokensUsed: tokensAgg._sum.tokensUsed || 0,
            subscription: subscription ? { limit: subscription.convLimit, used: subscription.convUsed } : null,
            chartData
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map