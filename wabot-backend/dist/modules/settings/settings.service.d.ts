import { PrismaService } from '../../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(businessAccountId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        category: string | null;
        operatingHours: import("@prisma/client/runtime/library").JsonValue | null;
        escalationPhone: string | null;
    } | null>;
    updateProfile(businessAccountId: string, data: any): Promise<{
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
    getAiConfig(businessAccountId: string): Promise<{
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
    } | null>;
    updateAiConfig(businessAccountId: string, data: any): Promise<{
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
    getWaSession(businessAccountId: string): Promise<{
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
    createWaSession(businessAccountId: string): Promise<{
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
    }>;
    disconnectWaSession(sessionId: string): Promise<{
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
    }>;
}
