import { OnboardingService } from './onboarding.service';
export declare class OnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
    startOnboarding(req: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        category: string | null;
        operatingHours: import("@prisma/client/runtime/library").JsonValue | null;
        escalationPhone: string | null;
    }>;
    getStatus(tenantId: string): Promise<{
        status: string;
        step: number;
    }>;
    createWaSession(tenantId: string): Promise<{
        id: string;
        businessAccountId: string;
        sessionId: string;
        phoneNumber: string | null;
        displayName: string | null;
        status: import(".prisma/client").$Enums.SessionStatus;
        qrCode: string | null;
        authKeys: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    saveAiConfig(tenantId: string, body: any): Promise<{
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
    addCatalog(tenantId: string, body: any): Promise<{
        id: string;
        businessAccountId: string;
        createdAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number | null;
        imageUrl: string | null;
        isActive: boolean;
    }>;
    completeOnboarding(tenantId: string, req: any): Promise<{
        success: boolean;
        redirect: string;
    }>;
}
