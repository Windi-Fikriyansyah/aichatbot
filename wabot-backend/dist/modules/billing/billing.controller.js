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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const tenant_access_guard_1 = require("../../guards/tenant-access.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let BillingController = class BillingController {
    billingService;
    constructor(billingService) {
        this.billingService = billingService;
    }
    getSubscription(tenantId) {
        return this.billingService.getSubscription(tenantId);
    }
    checkout(tenantId, plan) {
        return this.billingService.generateCheckoutLink(tenantId, plan);
    }
    async webhook(payload) {
        const { order_id, status } = payload;
        if (status === 'settlement' || status === 'success') {
            return this.billingService.processWebhook(order_id, status);
        }
        return { received: true };
    }
    upgradeMock(tenantId) {
        return this.billingService.upgradePlanMock(tenantId);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_access_guard_1.TenantAccessGuard),
    (0, roles_decorator_1.Roles)('OWNER'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_access_guard_1.TenantAccessGuard),
    (0, roles_decorator_1.Roles)('OWNER'),
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Body)('plan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)('webhook/pakasir'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "webhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_access_guard_1.TenantAccessGuard),
    (0, roles_decorator_1.Roles)('OWNER'),
    (0, common_1.Post)('upgrade-mock'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "upgradeMock", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('api/billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map