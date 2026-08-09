import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
  }

  async generateReply(params: {
    model: string;
    temperature: number;
    systemPrompt: string;
    history: { role: 'user' | 'assistant'; content: string }[];
    userMessage: string;
  }): Promise<{ reply: string; tokensUsed: number; latencyMs: number }> {
    const startTime = Date.now();
    const messages = [
      { role: 'system', content: params.systemPrompt },
      ...params.history,
      { role: 'user', content: params.userMessage },
    ];

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: params.model || 'anthropic/claude-3.5-sonnet',
          temperature: params.temperature ?? 0.7,
          messages,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://wabot.ai',
            'X-Title': 'WaBot AI Multi-Tenant',
            'Content-Type': 'application/json',
          },
        },
      );

      const latencyMs = Date.now() - startTime;
      const reply = response.data.choices[0]?.message?.content || '';
      const tokensUsed = response.data.usage?.total_tokens || 0;

      return { reply, tokensUsed, latencyMs };
    } catch (error: any) {
      this.logger.error('Error calling OpenRouter API:', error.response?.data || error.message);
      throw new Error('Gagal mendapatkan respon dari AI Router.');
    }
  }
}
