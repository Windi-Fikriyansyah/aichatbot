import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';
export declare class OnboardingService {
    private prisma;
    private baileys;
    constructor(prisma: PrismaService, baileys: BaileysService);
    startOnboarding(userId: string, data: any): Promise<{
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
    getStatus(userId: string): Promise<({
        memberships: ({
            businessAccount: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                slug: string;
                category: string | null;
                operatingHours: import("@prisma/client/runtime/library").JsonValue | null;
                escalationPhone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            businessAccountId: string;
            role: import(".prisma/client").$Enums.Role;
        })[];
    } & {
        id: string;
        email: string;
        password: string;
        name: string;
        refreshToken: string | null;
        onboarded: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
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
    completeOnboarding(userId: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        refreshToken: string | null;
        onboarded: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    saveAiConfig(tenantId: string, data: any): Promise<{
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
    addCatalog(tenantId: string, data: any): Promise<{
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
}
