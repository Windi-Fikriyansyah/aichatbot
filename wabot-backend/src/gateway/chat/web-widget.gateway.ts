import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@WebSocketGateway({ cors: { origin: '*' } })
export class WebWidgetGateway {
  @WebSocketServer()
  server: Server;

  constructor(@InjectQueue('process-web-message') private processQueue: Queue) {}

  @SubscribeMessage('joinWebVisitor')
  handleJoinWebVisitor(@MessageBody() data: { tenantId: string, channelSessionId: string }, @ConnectedSocket() client: Socket) {
    // Room name format: web-visitor-{channelSessionId}
    client.join(`web-visitor-${data.channelSessionId}`);
  }

  @SubscribeMessage('send-web-message')
  async handleWebMessage(@MessageBody() data: { tenantId: string, channelSessionId: string, content: string }, @ConnectedSocket() client: Socket) {
    if (!data.tenantId || !data.channelSessionId || !data.content) return;
    
    // Add to queue for AI processing
    await this.processQueue.add('process-web-message', {
      businessAccountId: data.tenantId,
      channelSessionId: data.channelSessionId,
      content: data.content
    });
  }

  emitAiStatus(channelSessionId: string, status: string) {
    this.server.to(`web-visitor-${channelSessionId}`).emit('ai-status', { status });
  }

  emitNewMessage(channelSessionId: string, message: any) {
    this.server.to(`web-visitor-${channelSessionId}`).emit('new-message', message);
  }
}
