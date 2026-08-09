"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let TeamService = class TeamService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMembers(businessAccountId) {
        return this.prisma.tenantMember.findMany({
            where: { businessAccountId },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    async inviteMember(businessAccountId, email, name, role) {
        let user = await this.prisma.user.findUnique({ where: { email } });
        let isNewUser = false;
        const defaultPassword = 'wabot' + Math.floor(1000 + Math.random() * 9000);
        if (!user) {
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            user = await this.prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword
                }
            });
            isNewUser = true;
        }
        const existingMember = await this.prisma.tenantMember.findUnique({
            where: {
                userId_businessAccountId: {
                    userId: user.id,
                    businessAccountId
                }
            }
        });
        if (existingMember) {
            throw new common_1.BadRequestException('Pengguna sudah menjadi anggota di tenant ini.');
        }
        const newMember = await this.prisma.tenantMember.create({
            data: {
                userId: user.id,
                businessAccountId,
                role
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        return {
            member: newMember,
            isNewUser,
            defaultPassword: isNewUser ? defaultPassword : null
        };
    }
    async updateRole(businessAccountId, memberId, role) {
        const member = await this.prisma.tenantMember.findUnique({
            where: { id: memberId }
        });
        if (!member || member.businessAccountId !== businessAccountId) {
            throw new common_1.NotFoundException('Anggota tidak ditemukan.');
        }
        if (member.role === 'OWNER' && role !== 'OWNER') {
            const ownerCount = await this.prisma.tenantMember.count({
                where: { businessAccountId, role: 'OWNER' }
            });
            if (ownerCount <= 1) {
                throw new common_1.BadRequestException('Tidak bisa mengubah role Owner terakhir.');
            }
        }
        return this.prisma.tenantMember.update({
            where: { id: memberId },
            data: { role },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });
    }
    async removeMember(businessAccountId, memberId) {
        const member = await this.prisma.tenantMember.findUnique({
            where: { id: memberId }
        });
        if (!member || member.businessAccountId !== businessAccountId) {
            throw new common_1.NotFoundException('Anggota tidak ditemukan.');
        }
        if (member.role === 'OWNER') {
            const ownerCount = await this.prisma.tenantMember.count({
                where: { businessAccountId, role: 'OWNER' }
            });
            if (ownerCount <= 1) {
                throw new common_1.BadRequestException('Tidak bisa menghapus Owner terakhir.');
            }
        }
        await this.prisma.tenantMember.delete({
            where: { id: memberId }
        });
        return { success: true };
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamService);
//# sourceMappingURL=team.service.js.map