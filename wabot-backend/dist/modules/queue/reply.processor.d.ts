import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';
export declare class ReplyProcessor extends WorkerHost {
    private prisma;
    private chatGateway;
    private baileys;
    private readonly logger;
    constructor(prisma: PrismaService, chatGateway: ChatGateway, baileys: BaileysService);
    process(job: Job<any>): Promise<{
        success: boolean;
    }>;
}
