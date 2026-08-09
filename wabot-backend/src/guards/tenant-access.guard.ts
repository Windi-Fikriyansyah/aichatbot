import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new UnauthorizedException('User belum terautentikasi.');
    }

    // Tenant ID dari header 'x-tenant-id' atau parameter route 'tenantId'
    const tenantId = request.headers['x-tenant-id'] || request.params.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID (businessAccountId) tidak ditemukan pada request.');
    }

    // Cek membership user di database — gunakan user.userId (dari JwtStrategy.validate)
    const membership = await this.prisma.tenantMember.findUnique({
      where: {
        userId_businessAccountId: {
          userId: user.userId,
          businessAccountId: tenantId,
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException('Akses ditolak. Anda bukan bagian dari tenant ini.');
    }

    // Role-Based Access Control
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(membership.role)) {
        throw new ForbiddenException(`Akses ditolak. Role Anda (${membership.role}) tidak mencukupi.`);
      }
    }

    // Inject tenant details ke request
    request.tenant = membership;

    return true;
  }
}
