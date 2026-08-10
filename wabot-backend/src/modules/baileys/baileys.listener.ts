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
            const rawJid = msg.key.remoteJid;
            // Hanya proses pesan dari chat pribadi (@s.whatsapp.net atau @lid)
            if (!rawJid?.includes('@s.whatsapp.net') && !rawJid?.includes('@lid')) {
              this.logger.log(`[DEBUG] Ignored message from non-private JID: ${rawJid}`);
              continue;
            }

            // Keep the domain (@s.whatsapp.net or @lid), but remove the device ID if present (e.g. :4)
            // Example rawJid: 62896...:4@s.whatsapp.net -> we want 62896...@s.whatsapp.net
            const jidParts = rawJid.split('@');
            const senderPhone = `${jidParts[0].split(':')[0]}@${jidParts[1]}`;
            
            const senderName = msg.pushName || senderPhone.split('@')[0];
            const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
            const waMessageId = msg.key.id;

            if (content && senderPhone) {
              this.logger.log(`Inbound text message received from ${senderPhone} for ${businessAccountId}`);
              
              // Tandai pesan sebagai telah dibaca agar indikator 'typing' bisa muncul di HP pengirim
              try {
                await sock.readMessages([msg.key]);
              } catch (e) {
                this.logger.warn(`Failed to mark message as read: ${e}`);
              }
              
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
