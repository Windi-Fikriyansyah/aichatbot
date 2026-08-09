import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { BaileysModule } from '../baileys/baileys.module';

@Module({
  imports: [PrismaModule, BaileysModule],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
