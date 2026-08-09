import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  emitQrCode(businessAccountId: string, qr: string) {
    this.server.emit(`wa-qr-${businessAccountId}`, { qr });
  }

  emitSessionStatus(businessAccountId: string, status: string) {
    this.server.emit(`wa-status-${businessAccountId}`, { status });
  }
}
