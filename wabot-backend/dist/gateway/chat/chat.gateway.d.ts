import { Server, Socket } from 'socket.io';
export declare class ChatGateway {
    server: Server;
    handleJoinTenant(tenantId: string, client: Socket): void;
    emitQrCode(businessAccountId: string, qr: string): void;
    emitSessionStatus(businessAccountId: string, status: string): void;
}
