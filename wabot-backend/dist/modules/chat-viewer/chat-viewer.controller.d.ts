import { ChatViewerService } from './chat-viewer.service';
export declare class ChatViewerController {
    private readonly chatViewerService;
    constructor(chatViewerService: ChatViewerService);
    getConversations(tenantId: string): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            role: import(".prisma/client").$Enums.MessageRole;
            content: string;
            mediaUrl: string | null;
            waMessageId: string | null;
            modelUsed: string | null;
            tokensUsed: number | null;
            latencyMs: number | null;
        }[];
    } & {
        id: string;
        businessAccountId: string;
        waSessionId: string | null;
        customerPhone: string | null;
        customerName: string | null;
        status: import(".prisma/client").$Enums.ConvStatus;
        channel: string;
        channelSessionId: string | null;
        lastMessageAt: Date | null;
        createdAt: Date;
    })[]>;
    getMessages(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.MessageRole;
        content: string;
        mediaUrl: string | null;
        waMessageId: string | null;
        modelUsed: string | null;
        tokensUsed: number | null;
        latencyMs: number | null;
    }[]>;
    updateStatus(tenantId: string, id: string, status: any): Promise<{
        id: string;
        businessAccountId: string;
        waSessionId: string | null;
        customerPhone: string | null;
        customerName: string | null;
        status: import(".prisma/client").$Enums.ConvStatus;
        channel: string;
        channelSessionId: string | null;
        lastMessageAt: Date | null;
        createdAt: Date;
    }>;
    reply(tenantId: string, id: string, data: {
        content: string;
        mediaUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.MessageRole;
        content: string;
        mediaUrl: string | null;
        waMessageId: string | null;
        modelUsed: string | null;
        tokensUsed: number | null;
        latencyMs: number | null;
    }>;
}
