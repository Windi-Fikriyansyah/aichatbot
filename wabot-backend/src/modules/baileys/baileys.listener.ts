import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BaileysListener {
  private readonly logger = new Logger(BaileysListener.name);

  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
    @InjectQueue('process-wa-message') private processQueue: Queue
  ) {}

  bindEvents(sock: any, businessAccountId: string, sessionId: string) {
    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        await this.prisma.waSession.upsert({
          where: { sessionId },
          update: { qrCode: qr, status: 'SCAN_QR_NEEDED' },
          create: { sessionId, businessAccountId, qrCode: qr, status: 'SCAN_QR_NEEDED' }
        });
        this.chatGateway.emitQrCode(businessAccountId, qr);
      }
      
      if (connection === 'open') {
        const phoneNumber = sock.user?.id.split(':')[0];
        await this.prisma.waSession.upsert({
          where: { sessionId },
          update: { status: 'CONNECTED', qrCode: null, phoneNumber },
          create: { sessionId, businessAccountId, status: 'CONNECTED', qrCode: null, phoneNumber }
        });
        this.chatGateway.emitSessionStatus(businessAccountId, 'CONNECTED');
        this.logger.log(`Session CONNECTED for ${businessAccountId}`);
      }
    });

    sock.ev.on('messages.upsert', async (m: any) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe) {
            const senderPhone = msg.key.remoteJid?.split('@')[0];
            const senderName = msg.pushName || senderPhone;
            const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
            const waMessageId = msg.key.id;

            if (content && senderPhone) {
              this.logger.log(`Inbound text message received from ${senderPhone} for ${businessAccountId}`);
              await this.processQueue.add('process-message', {
                businessAccountId,
                sessionId,
                senderPhone,
                senderName,
                content,
                waMessageId
              });
            }
          }
        }
      }
    });
  }
}
