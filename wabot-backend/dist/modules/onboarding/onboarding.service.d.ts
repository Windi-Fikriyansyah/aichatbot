import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';
export declare class OnboardingService {
    private prisma;
    private baileys;
    constructor(prisma: PrismaService, baileys: BaileysService);
    startOnboarding(userId: string, data: any): Promise<{
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
    getStatus(userId: string): Promise<({
        memberships: ({
            businessAccount: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                slug: string;
                category: string | null;
                operatingHours: import("@prisma/client/runtime/library").JsonValue | null;
                escalationPhone: string | null;
            };
        } & {
            id: string;
            businessAccountId: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role;
            userId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        password: string;
        email: string;
        refreshToken: string | null;
        onboarded: boolean;
    }) | null>;
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
    completeOnboarding(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        password: string;
        email: string;
        refreshToken: string | null;
        onboarded: boolean;
    }>;
    saveAiConfig(tenantId: string, data: any): Promise<{
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
    addCatalog(tenantId: string, data: any): Promise<{
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
}
