import { ChatViewerService } from './chat-viewer.service';
export declare class ChatViewerController {
    private readonly chatViewerService;
    constructor(chatViewerService: ChatViewerService);
    getConversations(tenantId: string): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.MessageRole;
            tokensUsed: number | null;
            latencyMs: number | null;
            waMessageId: string | null;
            content: string;
            mediaUrl: string | null;
            modelUsed: string | null;
            conversationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ConvStatus;
        businessAccountId: string;
        waSessionId: string;
        customerPhone: string;
        customerName: string | null;
        lastMessageAt: Date | null;
    })[]>;
    getMessages(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.MessageRole;
        tokensUsed: number | null;
        latencyMs: number | null;
        waMessageId: string | null;
        content: string;
        mediaUrl: string | null;
        modelUsed: string | null;
        conversationId: string;
    }[]>;
    updateStatus(tenantId: string, id: string, status: any): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ConvStatus;
        businessAccountId: string;
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
        role: import(".prisma/client").$Enums.MessageRole;
        tokensUsed: number | null;
        latencyMs: number | null;
        waMessageId: string | null;
        content: string;
        mediaUrl: string | null;
        modelUsed: string | null;
        conversationId: string;
    }>;
}
