import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Berasal dari TenantAccessGuard (request.tenant)
    // Jika hanya butuh ID-nya:
    return request.tenant?.businessAccountId || request.headers['x-tenant-id'] || request.params.tenantId;
  },
);
