import { BillingService } from './billing.service';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    getSubscription(tenantId: string): Promise<{
        id: string;
        plan: string;
        status: string;
        convUsed: number;
        convLimit: number;
        periodStart: Date;
        periodEnd: Date;
        userId: string;
    }>;
    checkout(tenantId: string, plan: string): Promise<{
        checkoutUrl: string;
        orderId: string;
    }>;
    webhook(payload: any): Promise<{
        success: boolean;
    } | {
        received: boolean;
    }>;
    upgradeMock(tenantId: string): Promise<{
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
