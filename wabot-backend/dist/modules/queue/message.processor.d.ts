import { WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenRouterService } from '../openrouter/openrouter.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';
import { BaileysService } from '../baileys/baileys.service';
export declare class MessageProcessor extends WorkerHost {
    private prisma;
    private openRouter;
    private chatGateway;
    private replyQueue;
    private baileys;
    private readonly logger;
    constructor(prisma: PrismaService, openRouter: OpenRouterService, chatGateway: ChatGateway, replyQueue: Queue, baileys: BaileysService);
    process(job: Job<any>): Promise<{
        success: boolean;
        reason: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        reason?: undefined;
    } | {
        success: boolean;
        reason?: undefined;
        message?: undefined;
    }>;
}
