import { Server } from 'socket.io';
export declare class ChatGateway {
    server: Server;
    emitQrCode(businessAccountId: string, qr: string): void;
    emitSessionStatus(businessAccountId: string, status: string): void;
}
