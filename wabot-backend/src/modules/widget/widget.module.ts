import { Module } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { WidgetController } from './widget.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WidgetService],
  controllers: [WidgetController],
  exports: [WidgetService],
})
export class WidgetModule {}
