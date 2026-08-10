import { PrismaService } from '../../prisma/prisma.service';
export declare class OpenRouterController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAiConfig(tenantId: string): Promise<{}>;
    updateAiConfig(tenantId: string, data: any): Promise<{
        id: string;
        businessAccountId: string;
        provider: string;
        model: string;
        temperature: number;
        tone: string;
        language: string;
        baseSystemPrompt: string | null;
        escalationKeywords: string[];
        maxHistoryMessages: number;
        knowledgeBase: string | null;
    }>;
    getModels(): {
        id: string;
        name: string;
    }[];
}
