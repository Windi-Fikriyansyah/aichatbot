import { Controller, Post, Body, Request, Get, UseGuards, Headers } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';

@Controller('api/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @UseGuards(JwtAuthGuard) // Only requires login, not tenant (because it creates the tenant)
  @Post('start')
  startOnboarding(@Request() req: any, @Body() body: any) {
    return this.onboardingService.startOnboarding(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Get('status')
  async getStatus(@Headers('x-tenant-id') tenantId: string) {
    return { status: 'IN_PROGRESS', step: 1 };
  }

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Post('wa-session')
  async createWaSession(@Headers('x-tenant-id') tenantId: string) {
    return this.onboardingService.createWaSession(tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Post('ai-config')
  async saveAiConfig(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.onboardingService.saveAiConfig(tenantId, body);
  }

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Post('catalog')
  async addCatalog(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.onboardingService.addCatalog(tenantId, body);
  }

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Post('complete')
  async completeOnboarding(@Headers('x-tenant-id') tenantId: string, @Request() req: any) {
    await this.onboardingService.completeOnboarding(req.user.userId);
    return { success: true, redirect: '/dashboard' };
  }
}
