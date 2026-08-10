import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WidgetService {
  constructor(private prisma: PrismaService) {}

  async getWidgetConfig(businessAccountId: string) {
    const config = await this.prisma.widgetConfig.findUnique({
      where: { businessAccountId }
    });

    if (!config) {
      // Return defaults without creating a record
      // (record is created when tenant saves settings from dashboard)
      return {
        id: null,
        businessAccountId,
        primaryColor: '#2563EB',
        welcomeMessage: 'Halo! Ada yang bisa saya bantu?',
        botName: 'Asisten Virtual',
        position: 'right',
      };
    }

    return config;
  }

  async updateWidgetConfig(businessAccountId: string, data: { primaryColor?: string, welcomeMessage?: string, botName?: string, position?: string }) {
    return this.prisma.widgetConfig.upsert({
      where: { businessAccountId },
      update: data,
      create: {
        businessAccountId,
        ...data
      }
    });
  }
}
