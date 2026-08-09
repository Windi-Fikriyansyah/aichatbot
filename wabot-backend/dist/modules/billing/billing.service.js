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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BillingService = class BillingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSubscription(businessAccountId) {
        const ownerMember = await this.prisma.tenantMember.findFirst({
            where: { businessAccountId, role: 'OWNER' }
        });
        if (!ownerMember)
            throw new common_1.NotFoundException('Owner not found for this tenant');
        return this.prisma.subscription.upsert({
            where: { userId: ownerMember.userId },
            update: {},
            create: {
                userId: ownerMember.userId,
                plan: 'STARTER',
                status: 'ACTIVE',
                convUsed: 0,
                convLimit: 500,
                periodStart: new Date(),
                periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
            }
        });
    }
    async generateCheckoutLink(businessAccountId, plan) {
        const ownerMember = await this.prisma.tenantMember.findFirst({
            where: { businessAccountId, role: 'OWNER' },
            include: { user: true }
        });
        if (!ownerMember)
            throw new common_1.NotFoundException('Owner not found for this tenant');
        const slug = process.env.PAKASIR_PROJECT_SLUG || 'default-slug';
        const orderId = `INV-${businessAccountId}-${Date.now()}`;
        const checkoutUrl = process.env.PAKASIR_PROJECT_SLUG
            ? `https://app.pakasir.com/pay/${slug}?order_id=${orderId}`
            : `http://localhost:3001/dashboard/billing?mock_success=true&order_id=${orderId}`;
        return { checkoutUrl, orderId };
    }
    async processWebhook(orderId, status) {
        return { success: true };
    }
    async upgradePlanMock(businessAccountId) {
        const ownerMember = await this.prisma.tenantMember.findFirst({
            where: { businessAccountId, role: 'OWNER' }
        });
        if (!ownerMember)
            throw new common_1.NotFoundException('Owner not found');
        const newPeriodEnd = new Date();
        newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);
        return this.prisma.subscription.update({
            where: { userId: ownerMember.userId },
            data: {
                plan: 'PRO',
                convLimit: 5000,
                periodEnd: newPeriodEnd
            }
        });
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map