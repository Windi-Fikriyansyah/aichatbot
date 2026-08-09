import { Controller, Get, Post, Headers, UseGuards, Body } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Roles('OWNER')
  @Get()
  getSubscription(@Headers('x-tenant-id') tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Roles('OWNER')
  @Post('checkout')
  checkout(@Headers('x-tenant-id') tenantId: string, @Body('plan') plan: string) {
    return this.billingService.generateCheckoutLink(tenantId, plan);
  }

  // Webhook dari Pakasir tidak dikawal oleh JwtAuthGuard karena dipanggil oleh eksternal
  @Post('webhook/pakasir')
  async webhook(@Body() payload: any) {
    // Pada skenario sebenarnya, validasi signature Pakasir dilakukan di sini
    const { order_id, status } = payload;
    if (status === 'settlement' || status === 'success') {
      // Untuk MVP, karena kita tidak nyimpan orderId, kita asumsikan webhook ini dummy
      return this.billingService.processWebhook(order_id, status);
    }
    return { received: true };
  }

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Roles('OWNER')
  @Post('upgrade-mock')
  upgradeMock(@Headers('x-tenant-id') tenantId: string) {
    // Endpoint ini untuk simulasi sukses dari Frontend setelah kembali dari Pakasir dummy
    return this.billingService.upgradePlanMock(tenantId);
  }
}
