import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(businessAccountId: string): Promise<{
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
