import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';
import { ConvStatus } from '@prisma/client';

@Injectable()
export class ChatViewerService {
  constructor(
    private prisma: PrismaService,
    private baileys: BaileysService,
    private chatGateway: ChatGateway
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

    return conv;
  }

  async replyToConversation(businessAccountId: string, conversationId: string, content: string, mediaUrl?: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId, businessAccountId }
    });

    if (!conv) throw new NotFoundException('Conversation not found');

    // Kirim via Baileys
    // TODO: implement send media if mediaUrl is provided
    let waMsgId;
    if (mediaUrl) {
      waMsgId = await this.baileys.sendMediaMessage(conv.waSessionId, conv.customerPhone, mediaUrl, content);
    } else {
      waMsgId = await this.baileys.sendMessage(conv.waSessionId, conv.customerPhone, content);
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

    // Emit ke dashboard supaya chat langsung muncul
    this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('new-message', newMessage);

    return newMessage;
  }
}
