import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(businessAccountId: string) {
    return this.prisma.businessAccount.findUnique({
      where: { id: businessAccountId }
    });
  }

  async updateProfile(businessAccountId: string, data: any) {
    return this.prisma.businessAccount.update({
      where: { id: businessAccountId },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        escalationPhone: data.escalationPhone
      }
    });
  }

  async getAiConfig(businessAccountId: string) {
    return this.prisma.aiConfig.findUnique({
      where: { businessAccountId }
    });
  }

  async updateAiConfig(businessAccountId: string, data: any) {
    return this.prisma.aiConfig.update({
      where: { businessAccountId },
      data: {
        provider: data.provider,
        model: data.model,
        temperature: data.temperature,
        tone: data.tone,
        language: data.language,
        escalationKeywords: data.escalationKeywords,
        knowledgeBase: data.knowledgeBase,
        baseSystemPrompt: data.baseSystemPrompt,
      }
    });
  }

  async getWaSession(businessAccountId: string) {
    return this.prisma.waSession.findFirst({
      where: { businessAccountId }
    });
  }

  async createWaSession(businessAccountId: string) {
    const sessionId = `sess-${businessAccountId}`;
    return this.prisma.waSession.upsert({
      where: { sessionId },
      update: {},
      create: {
        businessAccountId,
        sessionId,
      }
    });
  }

  async disconnectWaSession(sessionId: string) {
    return this.prisma.waSession.update({
      where: { sessionId },
      data: { status: 'DISCONNECTED', qrCode: null, phoneNumber: null },
    });
  }
}
