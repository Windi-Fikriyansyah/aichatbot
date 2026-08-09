import { Controller, Get, Put, Post, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ChatViewerService } from './chat-viewer.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';

@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('api/chat')
export class ChatViewerController {
  constructor(private readonly chatViewerService: ChatViewerService) {}

  @Get('conversations')
  getConversations(@Headers('x-tenant-id') tenantId: string) {
    return this.chatViewerService.getConversations(tenantId);
  }

  @Get('conversations/:id/messages')
  getMessages(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.chatViewerService.getMessages(tenantId, id);
  }

  @Put('conversations/:id/status')
  updateStatus(
    @Headers('x-tenant-id') tenantId: string, 
    @Param('id') id: string,
    @Body('status') status: any
  ) {
    return this.chatViewerService.updateConversationStatus(tenantId, id, status);
  }

  @Post('conversations/:id/reply')
  reply(
    @Headers('x-tenant-id') tenantId: string, 
    @Param('id') id: string,
    @Body() data: { content: string, mediaUrl?: string }
  ) {
    return this.chatViewerService.replyToConversation(tenantId, id, data.content, data.mediaUrl);
  }
}
