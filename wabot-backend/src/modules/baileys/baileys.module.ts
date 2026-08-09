import { Module, forwardRef } from '@nestjs/common';
import { BaileysService } from './baileys.service';
import { BaileysListener } from './baileys.listener';
import { PrismaModule } from '../../prisma/prisma.module';
import { GatewayModule } from '../../gateway/gateway.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, GatewayModule, forwardRef(() => QueueModule)],
  providers: [BaileysService, BaileysListener],
  exports: [BaileysService],
})
export class BaileysModule {}
