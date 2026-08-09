import { SettingsService } from './settings.service';
import { BaileysService } from '../baileys/baileys.service';
export declare class SettingsController {
    private readonly settingsService;
    private readonly baileysService;
    constructor(settingsService: SettingsService, baileysService: BaileysService);
    getProfile(tenantId: string): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string | null;
        category: string | null;
        operatingHours: import("@prisma/client/runtime/library").JsonValue | null;
        escalationPhone: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateProfile(tenantId: string, body: any): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string | null;
        category: string | null;
        operatingHours: import("@prisma/client/runtime/library").JsonValue | null;
        escalationPhone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAiConfig(tenantId: string): Promise<{
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
    } | null>;
    updateAiConfig(tenantId: string, body: any): Promise<{
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
    getWaSession(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessAccountId: string;
        sessionId: string;
        phoneNumber: string | null;
        displayName: string | null;
        status: import(".prisma/client").$Enums.SessionStatus;
        qrCode: string | null;
        authKeys: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    connectWa(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessAccountId: string;
        sessionId: string;
        phoneNumber: string | null;
        displayName: string | null;
        status: import(".prisma/client").$Enums.SessionStatus;
        qrCode: string | null;
        authKeys: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    logoutWa(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
