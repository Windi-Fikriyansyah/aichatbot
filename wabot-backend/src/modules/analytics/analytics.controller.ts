import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';

@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.analyticsService.getDashboardStats(tenantId);
  }
}
