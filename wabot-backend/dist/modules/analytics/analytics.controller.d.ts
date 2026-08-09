import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getStats(tenantId: string): Promise<{
        totalConversations: number;
        activeConversations: number;
        humanHandlingConversations: number;
        productsCount: number;
        tokensUsed: number;
        subscription: {
            limit: number;
            used: number;
        } | null;
        chartData: {
            date: string;
            chat: number;
        }[];
    }>;
}
