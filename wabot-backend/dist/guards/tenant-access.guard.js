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
exports.TenantAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let TenantAccessGuard = class TenantAccessGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User belum terautentikasi.');
        }
        const tenantId = request.headers['x-tenant-id'] || request.params.tenantId;
        if (!tenantId) {
            throw new common_1.ForbiddenException('Tenant ID (businessAccountId) tidak ditemukan pada request.');
        }
        const membership = await this.prisma.tenantMember.findUnique({
            where: {
                userId_businessAccountId: {
                    userId: user.userId,
                    businessAccountId: tenantId,
                }
            }
        });
        if (!membership) {
            throw new common_1.ForbiddenException('Akses ditolak. Anda bukan bagian dari tenant ini.');
        }
        if (requiredRoles && requiredRoles.length > 0) {
            if (!requiredRoles.includes(membership.role)) {
                throw new common_1.ForbiddenException(`Akses ditolak. Role Anda (${membership.role}) tidak mencukupi.`);
            }
        }
        request.tenant = membership;
        return true;
    }
};
exports.TenantAccessGuard = TenantAccessGuard;
exports.TenantAccessGuard = TenantAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector, prisma_service_1.PrismaService])
], TenantAccessGuard);
//# sourceMappingURL=tenant-access.guard.js.map