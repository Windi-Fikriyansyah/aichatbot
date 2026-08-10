import { Controller, Get, Put, Body, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';

@Controller('api/widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  // Public endpoint for the widget script to fetch config
  @Get('config/:businessAccountId')
  async getPublicConfig(@Param('businessAccountId') businessAccountId: string) {
    return this.widgetService.getWidgetConfig(businessAccountId);
  }

  // Protected endpoint for dashboard to update config
  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Put('config')
  async updateConfig(@Req() req: any, @Body() body: any) {
    const businessAccountId = req.tenant?.businessAccountId || req.headers['x-tenant-id'];
    if (!businessAccountId) throw new ForbiddenException();
    
    return this.widgetService.updateWidgetConfig(businessAccountId, body);
  }
}
