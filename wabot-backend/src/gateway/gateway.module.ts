import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { WebWidgetGateway } from './chat/web-widget.gateway';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'process-web-message',
    }),
  ],
  providers: [ChatGateway, WebWidgetGateway],
  exports: [ChatGateway, WebWidgetGateway]
})
export class GatewayModule {}
