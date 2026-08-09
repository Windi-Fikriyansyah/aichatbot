import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private baileys: BaileysService,
  ) {}

  async startOnboarding(userId: string, data: any) {
    const business = await this.prisma.businessAccount.create({
      data: {
        name: data.name,
        slug: data.slug || `biz-${Date.now()}`,
        category: data.category,
        operatingHours: data.operatingHours,
        escalationPhone: data.escalationPhone,
        members: {
          create: {
            userId: userId,
            role: 'OWNER'
          }
        }
      }
    });
    return business;
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: { include: { businessAccount: true } } }
    });
    return user;
  }

  async createWaSession(tenantId: string) {
    const sessionId = `sess-${tenantId}`;
    
    // Upsert session record in DB
    await this.prisma.waSession.upsert({
      where: { sessionId },
      update: {},
      create: {
        businessAccountId: tenantId,
        sessionId,
      }
    });
    
    // Init Baileys (will skip if already running)
    await this.baileys.initSession(tenantId, sessionId);

    // Give Baileys a moment to generate QR or detect existing connection
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Re-fetch session from DB (now has qrCode or CONNECTED status)
    const session = await this.prisma.waSession.findUnique({
      where: { sessionId }
    });

    return session;
  }

  async completeOnboarding(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { onboarded: true }
    });
  }

  async saveAiConfig(tenantId: string, data: any) {
    // Extract provider from model string (e.g. "anthropic/claude-3.5-sonnet" → "anthropic")
    const provider = data.provider || (data.model?.split('/')[0]) || 'openrouter';
    const model = data.model || 'anthropic/claude-3.5-sonnet';

    return this.prisma.aiConfig.upsert({
      where: { businessAccountId: tenantId },
      update: {
        provider,
        model,
        customSystemPrompt: data.customSystemPrompt,
        language: data.language || 'id',
      },
      create: {
        businessAccountId: tenantId,
        provider,
        model,
        customSystemPrompt: data.customSystemPrompt,
        language: data.language || 'id',
      }
    });
  }

  async addCatalog(tenantId: string, data: any) {
    return this.prisma.product.create({
      data: {
        businessAccountId: tenantId,
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
      }
    });
  }
}
