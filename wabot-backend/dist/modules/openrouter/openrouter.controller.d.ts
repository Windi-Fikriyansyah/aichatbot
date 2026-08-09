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
        customSystemPrompt: string | null;
        escalationKeywords: string[];
        maxHistoryMessages: number;
        businessDescription: string | null;
        catalogRules: string | null;
        faqManual: string | null;
        orderFlow: string | null;
        paymentShippingInfo: string | null;
        operationalHoursInfo: string | null;
        locationCodInfo: string | null;
        activePromoInfo: string | null;
        forbiddenTopics: string | null;
    }>;
    getModels(): {
        id: string;
        name: string;
    }[];
}
