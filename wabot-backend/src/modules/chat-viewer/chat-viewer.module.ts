import { Module, forwardRef } from '@nestjs/common';
import { ChatViewerService } from './chat-viewer.service';
import { ChatViewerController } from './chat-viewer.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { BaileysModule } from '../baileys/baileys.module';
import { GatewayModule } from '../../gateway/gateway.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule, 
    GatewayModule, 
    forwardRef(() => BaileysModule),
    BullModule.registerQueue({ name: 'process-wa-message' }),
    BullModule.registerQueue({ name: 'process-web-message' })
  ],
  controllers: [ChatViewerController],
  providers: [ChatViewerService]
})
export class ChatViewerModule {}
