import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openRouterApiKey: string;
  private readonly openAiApiKey: string;

  constructor(private configService: ConfigService) {
    this.openRouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
    this.openAiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  async generateReply(params: {
    provider?: string;
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

    const provider = params.provider || 'openai';
    let url = '';
    let apiKey = '';
    let headers: any = {
      'Content-Type': 'application/json',
    };

    if (provider === 'openrouter') {
      url = 'https://openrouter.ai/api/v1/chat/completions';
      apiKey = this.openRouterApiKey;
      headers = {
        ...headers,
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://wabot.ai',
        'X-Title': 'WaBot AI Multi-Tenant',
      };
    } else {
      // Default to OpenAI
      url = 'https://api.openai.com/v1/chat/completions';
      apiKey = this.openAiApiKey;
      headers = {
        ...headers,
        Authorization: `Bearer ${apiKey}`,
      };
    }

    try {
      const response = await axios.post(
        url,
        {
          model: params.model || 'gpt-4o-mini',
          temperature: params.temperature ?? 0.7,
          messages,
        },
        { headers }
      );

      const latencyMs = Date.now() - startTime;
      const reply = response.data.choices[0]?.message?.content || '';
      const tokensUsed = response.data.usage?.total_tokens || 0;

      return { reply, tokensUsed, latencyMs };
    } catch (error: any) {
      this.logger.error(`Error calling ${provider} API:`, error.response?.data || error.message);
      throw new Error(`Gagal mendapatkan respon dari AI (${provider}).`);
    }
  }
}
