import { Controller, Get, Put, Body, Headers, UseGuards, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BaileysService } from '../baileys/baileys.service';

@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('api/settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly baileysService: BaileysService
  ) {}

  @Roles('OWNER', 'ADMIN')
  @Get('profile')
  getProfile(@Headers('x-tenant-id') tenantId: string) {
    return this.settingsService.getProfile(tenantId);
  }

  @Roles('OWNER', 'ADMIN')
  @Put('profile')
  updateProfile(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.settingsService.updateProfile(tenantId, body);
  }

  @Roles('OWNER', 'ADMIN')
  @Get('ai-config')
  getAiConfig(@Headers('x-tenant-id') tenantId: string) {
    return this.settingsService.getAiConfig(tenantId);
  }

  @Roles('OWNER', 'ADMIN')
  @Put('ai-config')
  updateAiConfig(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.settingsService.updateAiConfig(tenantId, body);
  }

  @Roles('OWNER', 'ADMIN')
  @Get('wa-session')
  getWaSession(@Headers('x-tenant-id') tenantId: string) {
    return this.settingsService.getWaSession(tenantId);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('wa-connect')
  async connectWa(@Headers('x-tenant-id') tenantId: string) {
    let session = await this.settingsService.getWaSession(tenantId);
    
    if (!session) {
      session = await this.settingsService.createWaSession(tenantId);
    }
    
    const sessionId = session.sessionId;
    
    // Use initSession (not restartSession) to preserve existing auth.
    // This will skip if already running, or generate a new QR if not connected.
    await this.baileysService.initSession(tenantId, sessionId);
    
    // Wait a bit to allow Baileys to generate QR code and save to DB
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    session = await this.settingsService.getWaSession(tenantId);
    return session;
  }

  @Roles('OWNER', 'ADMIN')
  @Post('wa-logout')
  async logoutWa(@Headers('x-tenant-id') tenantId: string) {
    const session = await this.settingsService.getWaSession(tenantId);
    if (session) {
      await this.baileysService.logoutSession(session.sessionId);
      await this.settingsService.disconnectWaSession(session.sessionId);
    }
    return { success: true, message: 'Berhasil logout dari WhatsApp' };
  }
}
