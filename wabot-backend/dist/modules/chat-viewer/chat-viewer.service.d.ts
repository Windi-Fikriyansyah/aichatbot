import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';
import { ConvStatus } from '@prisma/client';
export declare class ChatViewerService {
    private prisma;
    private baileys;
    private chatGateway;
    constructor(prisma: PrismaService, baileys: BaileysService, chatGateway: ChatGateway);
    getConversations(businessAccountId: string): Promise<({
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
    getMessages(businessAccountId: string, conversationId: string): Promise<{
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
    updateConversationStatus(businessAccountId: string, conversationId: string, status: ConvStatus): Promise<{
        id: string;
        businessAccountId: string;
        status: import(".prisma/client").$Enums.ConvStatus;
        createdAt: Date;
        waSessionId: string;
        customerPhone: string;
        customerName: string | null;
        lastMessageAt: Date | null;
    }>;
    replyToConversation(businessAccountId: string, conversationId: string, content: string, mediaUrl?: string): Promise<{
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
