import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';

@Processor('send-wa-reply')
export class ReplyProcessor extends WorkerHost {
  private readonly logger = new Logger(ReplyProcessor.name);

  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
    @Inject(forwardRef(() => BaileysService))
    private baileys: BaileysService
  ) {
    super();
  }

  async process(job: Job<any>) {
    const { businessAccountId, sessionId, toPhone, content, tokensUsed, latencyMs, convId, modelUsed } = job.data;

    try {
      const jid = toPhone.includes('@') ? toPhone : `${toPhone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
      await this.baileys.sendPresenceUpdate(sessionId, 'paused', jid);
      const waMsgId = await this.baileys.sendMessage(sessionId, toPhone, content);

      // 2. Simpan pesan assistant ke database
      const newMessage = await this.prisma.message.create({
        data: {
          conversationId: convId || `${sessionId}-${toPhone}`,
          role: 'AI',
          content: content,
          waMessageId: waMsgId || null,
          tokensUsed,
          latencyMs,
          modelUsed
        }
      });

      // 3. Emit real-time event to Frontend
      this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('new-message', newMessage);

      this.logger.log(`Reply sent to ${toPhone}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to send reply: ${error.message}`);
      throw error;
    }
  }
}
