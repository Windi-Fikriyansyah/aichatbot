import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaileysListener } from './baileys.listener';
export declare class BaileysService implements OnModuleInit {
    private prisma;
    private baileysListener;
    private sessions;
    private readonly logger;
    constructor(prisma: PrismaService, baileysListener: BaileysListener);
    onModuleInit(): Promise<void>;
    initSession(businessAccountId: string, sessionId: string): Promise<void>;
    restartSession(businessAccountId: string, sessionId: string): Promise<void>;
    logoutSession(sessionId: string): Promise<void>;
    sendMessage(sessionId: string, toPhone: string, text: string): Promise<any>;
    sendMediaMessage(sessionId: string, toPhone: string, mediaUrl: string, caption?: string): Promise<any>;
}
