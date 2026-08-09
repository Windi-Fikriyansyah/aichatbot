import { PrismaService } from '../../prisma/prisma.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';
import { Queue } from 'bullmq';
export declare class BaileysListener {
    private prisma;
    private chatGateway;
    private processQueue;
    private readonly logger;
    constructor(prisma: PrismaService, chatGateway: ChatGateway, processQueue: Queue);
    bindEvents(sock: any, businessAccountId: string, sessionId: string): void;
}
