import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenRouterService } from '../openrouter/openrouter.service';
import { WebWidgetGateway } from '../../gateway/chat/web-widget.gateway';
import { ChatGateway } from '../../gateway/chat/chat.gateway';

@Processor('process-web-message')
export class WebMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(WebMessageProcessor.name);

  constructor(
    private prisma: PrismaService,
    private openRouter: OpenRouterService,
    private webGateway: WebWidgetGateway,
    private chatGateway: ChatGateway
  ) {
    super();
  }

  async process(job: Job<any>) {
    const { businessAccountId, channelSessionId, content, skipDbInsert } = job.data;
    
    // Emit "AI is typing..." to the Web Widget
    this.webGateway.emitAiStatus(channelSessionId, 'AI is thinking...');

    try {
      // 1. Pastikan Conversation ada sebelum menyimpan pesan
      let conv = await this.prisma.conversation.findFirst({
        where: { businessAccountId, channel: 'WEB', channelSessionId }
      });

      if (!conv) {
        conv = await this.prisma.conversation.create({
          data: {
            businessAccountId,
            channel: 'WEB',
            channelSessionId,
            customerName: 'Web Visitor',
          }
        });
      } else if (conv.status === 'RESOLVED') {
        conv = await this.prisma.conversation.update({
          where: { id: conv.id },
          data: { status: 'AI_HANDLING', lastMessageAt: new Date() }
        });
        this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('status-update', {
          conversationId: conv.id,
          status: 'AI_HANDLING'
        });
      } else {
        conv = await this.prisma.conversation.update({
          where: { id: conv.id },
          data: { lastMessageAt: new Date() }
        });
      }

      const convId = conv.id;

      // 2. Simpan pesan user ke database (kecuali jika di-skip)
      if (!skipDbInsert) {
        const newMessage = await this.prisma.message.create({
          data: {
            conversationId: convId,
            role: 'CUSTOMER',
            content: content,
          }
        });
        
        // Emit pesan masuk ke dashboard (ChatGateway)
        this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('new-message', newMessage);
      }

      if (conv.status !== 'AI_HANDLING') {
        this.logger.log(`Skipping AI for conv ${convId} - status: ${conv.status}`);
        this.webGateway.emitAiStatus(channelSessionId, 'AI skipped');
        return { success: true, message: 'AI Skipped due to status' };
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
      
      let systemPrompt = aiConfig?.baseSystemPrompt 
        ? aiConfig.baseSystemPrompt
            .replace(/\{\{nama_bisnis\}\}/g, bizName)
            .replace(/\{\{bahasa\}\}/g, lang)
            .replace(/\{\{gaya_bahasa\}\}/g, tone)
        : `Anda adalah asisten AI untuk ${bizName}. Jawab dengan ${tone} menggunakan bahasa ${lang}.`;

      if (aiConfig?.knowledgeBase) systemPrompt += `\nKnowledge Base:\n${aiConfig.knowledgeBase}\n`;
      
      if (products.length > 0) {
        systemPrompt += `\nKatalog Produk:\n${products
          .map(p => `- ${p.name}: Rp${Number(p.price || 0).toLocaleString('id-ID')} (Stok: ${p.stock || 0}) - ${p.description || ''}`)
          .join('\n')}\n`;
      }

      const formattedHistory = history.reverse().map(m => ({
        role: (m.role === 'CUSTOMER' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content
      }));
      
      // Remove the last message from history since we send it as userMessage
      // BUT ONLY if we are NOT skipping DB insert. 
      // If skipDbInsert is true, the userMessage (content) is ALREADY in the history!
      // Actually, if skipDbInsert is true, the `content` passed is the last message. We should pop it to avoid duplicate.
      formattedHistory.pop(); 

      // 4. Generate Reply
      const aiResponse = await this.openRouter.generateReply({
        model: aiConfig?.model || 'anthropic/claude-3.5-sonnet',
        temperature: aiConfig?.temperature || 0.7,
        systemPrompt,
        history: formattedHistory,
        userMessage: content,
      });

      // 5. Simpan balasan ke database
      const newAiMessage = await this.prisma.message.create({
        data: {
          conversationId: convId,
          role: 'AI',
          content: aiResponse.reply,
          tokensUsed: aiResponse.tokensUsed,
          latencyMs: aiResponse.latencyMs,
          modelUsed: aiConfig?.model || 'anthropic/claude-3.5-sonnet'
        }
      });

      // Emit real-time event to Frontend Dashboard
      this.chatGateway.server.to(`tenant-${businessAccountId}`).emit('new-message', newAiMessage);
      
      // Emit to Web Widget
      this.webGateway.emitNewMessage(channelSessionId, newAiMessage);
      this.webGateway.emitAiStatus(channelSessionId, 'AI finished typing');

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to process web message: ${error.message}`);
      this.webGateway.emitAiStatus(channelSessionId, 'Error generating reply');
      throw error;
    }
  }
}
