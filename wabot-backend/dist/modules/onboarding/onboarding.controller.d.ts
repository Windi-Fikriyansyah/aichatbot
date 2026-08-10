import { OnboardingService } from './onboarding.service';
export declare class OnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
    startOnboarding(req: any, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SessionStatus;
        businessAccountId: string;
        sessionId: string;
        phoneNumber: string | null;
        displayName: string | null;
        qrCode: string | null;
        authKeys: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    saveAiConfig(tenantId: string, body: any): Promise<{
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
    addCatalog(tenantId: string, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        businessAccountId: string;
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
