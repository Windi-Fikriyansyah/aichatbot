import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenRouterService } from '../openrouter/openrouter.service';
import { ChatGateway } from '../../gateway/chat/chat.gateway';

@Processor('process-wa-message')
export class MessageProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageProcessor.name);

  constructor(
    private prisma: PrismaService,
    private openRouter: OpenRouterService,
    private chatGateway: ChatGateway,
    @InjectQueue('send-wa-reply') private replyQueue: Queue
  ) {
    super();
  }

  async process(job: Job<any>) {
    const { businessAccountId, waMessageId, sessionId, senderPhone, content, senderName } = job.data;
    
    // Emit "AI is typing..."
    this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('ai-status', { status: 'AI is thinking...', senderPhone });

    try {
      // 1. Pastikan Conversation ada sebelum menyimpan pesan
      let conv = await this.prisma.conversation.findFirst({
        where: { waSessionId: sessionId, customerPhone: senderPhone }
      });

      if (conv) {
        conv = await this.prisma.conversation.update({
          where: { id: conv.id },
          data: { customerName: senderName, lastMessageAt: new Date() }
        });
      } else {
        // Enforce subscription limit before creating new conversation
        const owner = await this.prisma.tenantMember.findFirst({
          where: { businessAccountId, role: 'OWNER' }
        });
        if (owner) {
          const sub = await this.prisma.subscription.findUnique({ where: { userId: owner.userId } });
          if (sub && sub.convUsed >= sub.convLimit) {
            this.logger.warn(`Tenant ${businessAccountId} reached conversation limit.`);
            // Skip processing if limit reached
            return { success: false, reason: 'limit_reached' };
          }
          // Increment usage
          if (sub) {
            await this.prisma.subscription.update({
              where: { id: sub.id },
              data: { convUsed: { increment: 1 } }
            });
          }
        }

        conv = await this.prisma.conversation.create({
          data: {
            businessAccountId,
            waSessionId: sessionId,
            customerPhone: senderPhone,
            customerName: senderName,
          }
        });
      }
      const convId = conv.id;

      // Reset status to AI_HANDLING if it was RESOLVED
      if (conv.status === 'RESOLVED') {
        conv = await this.prisma.conversation.update({
          where: { id: conv.id },
          data: { status: 'AI_HANDLING' }
        });
        this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('status-update', {
          conversationId: conv.id,
          status: 'AI_HANDLING'
        });
      }

      // 2. Simpan pesan user ke database
      const newMessage = await this.prisma.message.create({
        data: {
          conversationId: convId,
          role: 'CUSTOMER',
          content: content,
          waMessageId,
        }
      });

      // Emit pesan masuk ke dashboard
      this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('new-message', newMessage);

      if (conv.status !== 'AI_HANDLING') {
        // Skip AI processing if human is handling or needs human
        return { success: true, message: 'AI Skipped due to status: ' + conv.status };
      }

      // 3. Build Context
      const aiConfig = await this.prisma.aiConfig.findUnique({
        where: { businessAccountId },
        include: { businessAccount: true }
      });
      const products = await this.prisma.product.findMany({
        where: { businessAccountId }
      });
      
      const history = await this.prisma.message.findMany({
        where: { conversationId: convId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const bizName = aiConfig?.businessAccount?.name || 'Bisnis';
      const tone = aiConfig?.tone || 'friendly';
      const lang = aiConfig?.language || 'id';
      
      let systemPrompt = `Anda adalah asisten virtual resmi untuk ${bizName}. Gunakan bahasa ${lang} dengan nada ${tone}.\n`;
      if (aiConfig?.customSystemPrompt) systemPrompt += `\nInstruksi Utama:\n${aiConfig.customSystemPrompt}\n`;
      if (aiConfig?.businessDescription) systemPrompt += `\nDeskripsi Bisnis:\n${aiConfig.businessDescription}\n`;
      if (aiConfig?.catalogRules) systemPrompt += `\nAturan Katalog:\n${aiConfig.catalogRules}\n`;
      
      if (products.length > 0) {
        systemPrompt += `\nKatalog Produk Aktif:\n${products.map(p => `- ${p.name}: Rp${p.price} (Stok: ${p.stock}) - ${p.description}`).join('\n')}\n`;
      }
      
      if (aiConfig?.faqManual) systemPrompt += `\nFAQ / Pertanyaan Umum:\n${aiConfig.faqManual}\n`;
      if (aiConfig?.orderFlow) systemPrompt += `\nAlur Pemesanan:\n${aiConfig.orderFlow}\n`;
      if (aiConfig?.paymentShippingInfo) systemPrompt += `\nInfo Pembayaran & Pengiriman:\n${aiConfig.paymentShippingInfo}\n`;
      if (aiConfig?.operationalHoursInfo) systemPrompt += `\nJam Operasional:\n${aiConfig.operationalHoursInfo}\n`;
      if (aiConfig?.locationCodInfo) systemPrompt += `\nLokasi & Info COD:\n${aiConfig.locationCodInfo}\n`;
      if (aiConfig?.activePromoInfo) systemPrompt += `\nPromo Aktif:\n${aiConfig.activePromoInfo}\n`;
      if (aiConfig?.forbiddenTopics) systemPrompt += `\nPANTANGAN (JANGAN BAHAS INI):\n${aiConfig.forbiddenTopics}\n`;

      const formattedHistory = history.reverse().map(m => ({
        role: (m.role === 'CUSTOMER' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content
      }));

      // Remove the last message from history since we send it as userMessage
      formattedHistory.pop();

      // 3. Generate Reply
      const aiResponse = await this.openRouter.generateReply({
        model: aiConfig?.model || 'anthropic/claude-3.5-sonnet',
        temperature: aiConfig?.temperature || 0.7,
        systemPrompt,
        history: formattedHistory,
        userMessage: content,
      });

      // 4. Masukkan balasan ke antrean pengiriman
      await this.replyQueue.add('send-reply', {
        businessAccountId,
        sessionId,
        toPhone: senderPhone,
        content: aiResponse.reply,
        tokensUsed: aiResponse.tokensUsed,
        latencyMs: aiResponse.latencyMs,
        convId,
        modelUsed: aiConfig?.model || 'anthropic/claude-3.5-sonnet'
      });

      this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('ai-status', { status: 'AI finished typing', senderPhone });
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to process message: ${error.message}`);
      this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('ai-status', { status: 'Error generating reply', senderPhone });
      throw error;
    }
  }
}
