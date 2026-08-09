import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getSubscription(businessAccountId: string) {
    const ownerMember = await this.prisma.tenantMember.findFirst({
      where: { businessAccountId, role: 'OWNER' }
    });

    if (!ownerMember) throw new NotFoundException('Owner not found for this tenant');

    return this.prisma.subscription.upsert({
      where: { userId: ownerMember.userId },
      update: {},
      create: {
        userId: ownerMember.userId,
        plan: 'STARTER',
        status: 'ACTIVE',
        convUsed: 0,
        convLimit: 500,
        periodStart: new Date(),
        periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
      }
    });
  }

  async generateCheckoutLink(businessAccountId: string, plan: string) {
    const ownerMember = await this.prisma.tenantMember.findFirst({
      where: { businessAccountId, role: 'OWNER' },
      include: { user: true }
    });

    if (!ownerMember) throw new NotFoundException('Owner not found for this tenant');

    const slug = process.env.PAKASIR_PROJECT_SLUG || 'default-slug';
    
    // Asumsi harga PRO adalah Rp 150.000
    // Pakasir biasanya menerima query parameter atau kita arahkan ke slug checkout mereka.
    // Jika integrasi penuh dibutuhkan, gunakan Axios ke endpoint API Pakasir.
    // Di sini kita membuat URL pembayaran mock/redirect
    
    const orderId = `INV-${businessAccountId}-${Date.now()}`;
    
    const checkoutUrl = process.env.PAKASIR_PROJECT_SLUG 
      ? `https://app.pakasir.com/pay/${slug}?order_id=${orderId}` 
      : `http://localhost:3001/dashboard/billing?mock_success=true&order_id=${orderId}`;

    return { checkoutUrl, orderId };
  }

  async processWebhook(orderId: string, status: string) {
    // Pada implementasi nyata, Pakasir webhook akan memberikan data orderId & status.
    // Kita akan mencari user/tenant berdasarkan orderId dan update subscription.
    // Untuk MVP, karena kita tidak menyimpan orderId di tabel secara permanen, kita
    // akan menggunakan logika mock di controller untuk memanggil fungsi upgrade di bawah.
    return { success: true };
  }

  async upgradePlanMock(businessAccountId: string) {
    const ownerMember = await this.prisma.tenantMember.findFirst({
      where: { businessAccountId, role: 'OWNER' }
    });

    if (!ownerMember) throw new NotFoundException('Owner not found');

    const newPeriodEnd = new Date();
    newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);

    return this.prisma.subscription.update({
      where: { userId: ownerMember.userId },
      data: {
        plan: 'PRO',
        convLimit: 5000,
        periodEnd: newPeriodEnd
      }
    });
  }
}
