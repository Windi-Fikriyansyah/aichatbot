import { Module, forwardRef } from '@nestjs/common';
import { ChatViewerService } from './chat-viewer.service';
import { ChatViewerController } from './chat-viewer.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { BaileysModule } from '../baileys/baileys.module';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [PrismaModule, GatewayModule, forwardRef(() => BaileysModule)],
  controllers: [ChatViewerController],
  providers: [ChatViewerService]
})
export class ChatViewerModule {}
