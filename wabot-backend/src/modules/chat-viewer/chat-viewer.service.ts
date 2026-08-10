import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';
import { WebWidgetGateway } from '../../gateway/chat/web-widget.gateway';
import { ConvStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ChatViewerService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => BaileysService))
    private baileys: BaileysService,
    private chatGateway: ChatGateway,
    private webGateway: WebWidgetGateway,
    @InjectQueue('process-wa-message') private processWaQueue: Queue,
    @InjectQueue('process-web-message') private processWebQueue: Queue
  ) {}

  async getConversations(businessAccountId: string) {
    return this.prisma.conversation.findMany({
      where: { businessAccountId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }

  async getMessages(businessAccountId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId, businessAccountId }
    });
    
    if (!conv) throw new NotFoundException('Conversation not found');

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async updateConversationStatus(businessAccountId: string, conversationId: string, status: ConvStatus) {
    const conv = await this.prisma.conversation.update({
      where: { id: conversationId, businessAccountId },
      data: { status }
    });

    // Emit event ke dashboard
    this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('status-update', {
      conversationId,
      status
    });

    // Jika diubah menjadi AI_HANDLING, periksa pesan terakhir. 
    // Jika dari pelanggan, picu antrean AI agar otomatis membalas.
    if (status === 'AI_HANDLING') {
      const lastMsg = await this.prisma.message.findFirst({
        where: { conversationId },
        orderBy: { createdAt: 'desc' }
      });

      if (lastMsg && lastMsg.role === 'CUSTOMER') {
        if (conv.channel === 'WEB' && conv.channelSessionId) {
          await this.processWebQueue.add('process-web-message', {
            businessAccountId,
            channelSessionId: conv.channelSessionId,
            content: lastMsg.content,
            skipDbInsert: true
          });
        } else if (conv.channel === 'WHATSAPP' && conv.waSessionId && conv.customerPhone) {
          // Trigger process-wa-message for WhatsApp
          const waSession = await this.prisma.waSession.findUnique({ where: { id: conv.waSessionId } });
          if (waSession) {
            await this.processWaQueue.add('process-message', {
              tenantId: businessAccountId,
              sessionId: waSession.sessionId,
              message: {
                key: { remoteJid: conv.customerPhone },
                message: { conversation: lastMsg.content }
              },
              skipDbInsert: true
            });
          }
        }
      }
    }

    return conv;
  }

  async replyToConversation(businessAccountId: string, conversationId: string, content: string, mediaUrl?: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId, businessAccountId },
      include: { waSession: true }
    });

    if (!conv) throw new NotFoundException('Conversation not found');

    let waMsgId;

    if (conv.channel === 'WHATSAPP') {
      if (!conv.waSession || !conv.customerPhone) {
        throw new Error('Invalid WhatsApp conversation: Missing session or customer phone');
      }
      if (mediaUrl) {
        waMsgId = await this.baileys.sendMediaMessage(conv.waSession.sessionId, conv.customerPhone, mediaUrl, content);
      } else {
        waMsgId = await this.baileys.sendMessage(conv.waSession.sessionId, conv.customerPhone, content);
      }
    }

    // Simpan ke DB
    const newMessage = await this.prisma.message.create({
      data: {
        conversationId: conv.id,
        role: 'HUMAN_AGENT',
        content: content || (mediaUrl ? '[Media]' : ''),
        mediaUrl: mediaUrl || null,
        waMessageId: waMsgId || null,
      }
    });

    if (conv.channel === 'WEB' && conv.channelSessionId) {
      this.webGateway.emitNewMessage(conv.channelSessionId, newMessage);
    }

    // Emit ke dashboard supaya chat langsung muncul
    this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('new-message', newMessage);

    return newMessage;
  }
}
