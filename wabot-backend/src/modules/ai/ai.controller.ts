import { Controller, Get, Put, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api')
export class AiController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Roles('OWNER', 'ADMIN')
  @Get('tenant/:tenantId/ai-config')
  async getAiConfig(@Headers('x-tenant-id') tenantId: string) {
    const config = await this.prisma.aiConfig.findUnique({
      where: { businessAccountId: tenantId }
    });
    return config || {};
  }

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Roles('OWNER', 'ADMIN')
  @Put('tenant/:tenantId/ai-config')
  async updateAiConfig(
    @Headers('x-tenant-id') tenantId: string,
    @Body() data: any,
  ) {
    const provider = data.provider || 'openai';
    
    const config = await this.prisma.aiConfig.upsert({
      where: { businessAccountId: tenantId },
      update: {
        provider,
        model: data.model,
        temperature: data.temperature,
      },
      create: {
        businessAccountId: tenantId,
        provider,
        model: data.model || 'gpt-4o-mini',
        temperature: data.temperature || 0.7,
      }
    });
    return config;
  }

  @UseGuards(JwtAuthGuard)
  @Get('ai/models')
  getModels() {
    return [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Cepat)', provider: 'openai' },
      { id: 'gpt-4o', name: 'GPT-4o (Pintar)', provider: 'openai' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'openrouter' },
      { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'openrouter' },
      { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nvidia Nemotron 120B (Free)', provider: 'openrouter' }
    ];
  }
}
