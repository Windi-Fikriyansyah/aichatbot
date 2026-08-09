import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(businessAccountId: string) {
    const totalConversations = await this.prisma.conversation.count({
      where: { businessAccountId }
    });

    const productsCount = await this.prisma.product.count({
      where: { businessAccountId }
    });

    const tokensAgg = await this.prisma.message.aggregate({
      where: { conversation: { businessAccountId }, role: 'AI' },
      _sum: { tokensUsed: true }
    });

    const activeConversations = await this.prisma.conversation.count({
      where: { businessAccountId, status: 'AI_HANDLING' }
    });

    const humanHandlingConversations = await this.prisma.conversation.count({
      where: { businessAccountId, status: { in: ['HUMAN_HANDLING', 'NEEDS_HUMAN'] } }
    });

    // Cari owner dari businessAccount ini
    const ownerMember = await this.prisma.tenantMember.findFirst({
      where: { businessAccountId, role: 'OWNER' }
    });

    let subscription = null;
    if (ownerMember) {
      // Ambil data limit
      subscription = await this.prisma.subscription.findFirst({
        where: { userId: ownerMember.userId, status: 'ACTIVE' }
      });
    }

    // Buat data grafik 7 hari terakhir
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);

      const count = await this.prisma.conversation.count({
        where: {
          businessAccountId,
          createdAt: {
            gte: d,
            lt: nextDay
          }
        }
      });

      chartData.push({
        date: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        chat: count
      });
    }

    return {
      totalConversations,
      activeConversations,
      humanHandlingConversations,
      productsCount,
      tokensUsed: tokensAgg._sum.tokensUsed || 0,
      subscription: subscription ? { limit: subscription.convLimit, used: subscription.convUsed } : null,
      chartData
    };
  }
}
