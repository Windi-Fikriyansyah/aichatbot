import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessageProcessor } from './message.processor';
import { ReplyProcessor } from './reply.processor';
import { WebMessageProcessor } from './web-message.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { OpenRouterModule } from '../openrouter/openrouter.module';
import { BaileysModule } from '../baileys/baileys.module';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', '127.0.0.1'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'process-wa-message',
    }),
    BullModule.registerQueue({
      name: 'send-wa-reply',
    }),
    PrismaModule,
    OpenRouterModule,
    forwardRef(() => BaileysModule),
    GatewayModule
  ],
  providers: [MessageProcessor, ReplyProcessor, WebMessageProcessor],
  exports: [BullModule]
})
export class QueueModule {}
