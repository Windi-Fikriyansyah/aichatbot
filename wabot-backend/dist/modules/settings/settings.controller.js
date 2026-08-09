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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const tenant_access_guard_1 = require("../../guards/tenant-access.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const baileys_service_1 = require("../baileys/baileys.service");
let SettingsController = class SettingsController {
    settingsService;
    baileysService;
    constructor(settingsService, baileysService) {
        this.settingsService = settingsService;
        this.baileysService = baileysService;
    }
    getProfile(tenantId) {
        return this.settingsService.getProfile(tenantId);
    }
    updateProfile(tenantId, body) {
        return this.settingsService.updateProfile(tenantId, body);
    }
    getAiConfig(tenantId) {
        return this.settingsService.getAiConfig(tenantId);
    }
    updateAiConfig(tenantId, body) {
        return this.settingsService.updateAiConfig(tenantId, body);
    }
    getWaSession(tenantId) {
        return this.settingsService.getWaSession(tenantId);
    }
    async connectWa(tenantId) {
        let session = await this.settingsService.getWaSession(tenantId);
        if (!session) {
            session = await this.settingsService.createWaSession(tenantId);
        }
        const sessionId = session.sessionId;
        await this.baileysService.initSession(tenantId, sessionId);
        await new Promise(resolve => setTimeout(resolve, 2500));
        session = await this.settingsService.getWaSession(tenantId);
        return session;
    }
    async logoutWa(tenantId) {
        const session = await this.settingsService.getWaSession(tenantId);
        if (session) {
            await this.baileysService.logoutSession(session.sessionId);
            await this.settingsService.disconnectWaSession(session.sessionId);
        }
        return { success: true, message: 'Berhasil logout dari WhatsApp' };
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getProfile", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateProfile", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Get)('ai-config'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getAiConfig", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Put)('ai-config'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateAiConfig", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Get)('wa-session'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getWaSession", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Post)('wa-connect'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "connectWa", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Post)('wa-logout'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "logoutWa", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_access_guard_1.TenantAccessGuard),
    (0, common_1.Controller)('api/settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService,
        baileys_service_1.BaileysService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map