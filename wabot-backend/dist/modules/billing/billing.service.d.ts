import { PrismaService } from '../../prisma/prisma.service';
export declare class BillingService {
    private prisma;
    constructor(prisma: PrismaService);
    getSubscription(businessAccountId: string): Promise<{
        id: string;
        plan: string;
        status: string;
        convUsed: number;
        convLimit: number;
        periodStart: Date;
        periodEnd: Date;
        userId: string;
    }>;
    generateCheckoutLink(businessAccountId: string, plan: string): Promise<{
        checkoutUrl: string;
        orderId: string;
    }>;
    processWebhook(orderId: string, status: string): Promise<{
        success: boolean;
    }>;
    upgradePlanMock(businessAccountId: string): Promise<{
        id: string;
        plan: string;
        status: string;
        convUsed: number;
        convLimit: number;
        periodStart: Date;
        periodEnd: Date;
        userId: string;
    }>;
}
