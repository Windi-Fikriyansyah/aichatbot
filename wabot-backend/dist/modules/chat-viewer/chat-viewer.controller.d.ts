import { ChatViewerService } from './chat-viewer.service';
export declare class ChatViewerController {
    private readonly chatViewerService;
    constructor(chatViewerService: ChatViewerService);
    getConversations(tenantId: string): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            content: string;
            tokensUsed: number | null;
            latencyMs: number | null;
            modelUsed: string | null;
            role: import(".prisma/client").$Enums.MessageRole;
            mediaUrl: string | null;
            waMessageId: string | null;
            conversationId: string;
        }[];
    } & {
        id: string;
        businessAccountId: string;
        status: import(".prisma/client").$Enums.ConvStatus;
        createdAt: Date;
        waSessionId: string;
        customerPhone: string;
        customerName: string | null;
        lastMessageAt: Date | null;
    })[]>;
    getMessages(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        tokensUsed: number | null;
        latencyMs: number | null;
        modelUsed: string | null;
        role: import(".prisma/client").$Enums.MessageRole;
        mediaUrl: string | null;
        waMessageId: string | null;
        conversationId: string;
    }[]>;
    updateStatus(tenantId: string, id: string, status: any): Promise<{
        id: string;
        businessAccountId: string;
        status: import(".prisma/client").$Enums.ConvStatus;
        createdAt: Date;
        waSessionId: string;
        customerPhone: string;
        customerName: string | null;
        lastMessageAt: Date | null;
    }>;
    reply(tenantId: string, id: string, data: {
        content: string;
        mediaUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        tokensUsed: number | null;
        latencyMs: number | null;
        modelUsed: string | null;
        role: import(".prisma/client").$Enums.MessageRole;
        mediaUrl: string | null;
        waMessageId: string | null;
        conversationId: string;
    }>;
}
