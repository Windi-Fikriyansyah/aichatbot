import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { BaileysModule } from '../baileys/baileys.module';

@Module({
  imports: [PrismaModule, BaileysModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
