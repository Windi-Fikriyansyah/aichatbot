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
    getMessages(businessAccountId: string, conversationId: string): Promise<{
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
    updateConversationStatus(businessAccountId: string, conversationId: string, status: ConvStatus): Promise<{
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
    replyToConversation(businessAccountId: string, conversationId: string, content: string, mediaUrl?: string): Promise<{
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
