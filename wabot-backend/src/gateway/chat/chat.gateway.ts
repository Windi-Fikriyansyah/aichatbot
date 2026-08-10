import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinTenant')
  handleJoinTenant(@MessageBody() tenantId: string, @ConnectedSocket() client: Socket) {
    client.join(`tenant-${tenantId}`);
  }

  emitQrCode(businessAccountId: string, qr: string) {
    this.server.emit(`wa-qr-${businessAccountId}`, { qr });
  }

  emitSessionStatus(businessAccountId: string, status: string) {
    this.server.emit(`wa-status-${businessAccountId}`, { status });
  }
}
