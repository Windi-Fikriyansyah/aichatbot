import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';
import { WebWidgetGateway } from '../../gateway/chat/web-widget.gateway';
import { ConvStatus } from '@prisma/client';
import { Queue } from 'bullmq';
export declare class ChatViewerService {
    private prisma;
    private baileys;
    private chatGateway;
    private webGateway;
    private processWaQueue;
    private processWebQueue;
    constructor(prisma: PrismaService, baileys: BaileysService, chatGateway: ChatGateway, webGateway: WebWidgetGateway, processWaQueue: Queue, processWebQueue: Queue);
    getConversations(businessAccountId: string): Promise<({
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
        waSessionId: string | null;
        customerPhone: string | null;
        customerName: string | null;
        channel: string;
        channelSessionId: string | null;
        lastMessageAt: Date | null;
    })[]>;
    getMessages(businessAccountId: string, conversationId: string): Promise<{
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
    updateConversationStatus(businessAccountId: string, conversationId: string, status: ConvStatus): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ConvStatus;
        businessAccountId: string;
        waSessionId: string | null;
        customerPhone: string | null;
        customerName: string | null;
        channel: string;
        channelSessionId: string | null;
        lastMessageAt: Date | null;
    }>;
    replyToConversation(businessAccountId: string, conversationId: string, content: string, mediaUrl?: string): Promise<{
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
