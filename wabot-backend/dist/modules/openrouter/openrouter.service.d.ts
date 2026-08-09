import { ConfigService } from '@nestjs/config';
export declare class OpenRouterService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    constructor(configService: ConfigService);
    generateReply(params: {
        model: string;
        temperature: number;
        systemPrompt: string;
        history: {
            role: 'user' | 'assistant';
            content: string;
        }[];
        userMessage: string;
    }): Promise<{
        reply: string;
        tokensUsed: number;
        latencyMs: number;
    }>;
}
