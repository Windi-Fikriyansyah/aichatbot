import { SettingsService } from './settings.service';
import { BaileysService } from '../baileys/baileys.service';
export declare class SettingsController {
    private readonly settingsService;
    private readonly baileysService;
    constructor(settingsService: SettingsService, baileysService: BaileysService);
    getProfile(tenantId: string): Promise<{
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
    updateProfile(tenantId: string, body: any): Promise<{
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
    getAiConfig(tenantId: string): Promise<{
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
    updateAiConfig(tenantId: string, body: any): Promise<{
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
    getWaSession(tenantId: string): Promise<{
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
    connectWa(tenantId: string): Promise<{
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
    logoutWa(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
