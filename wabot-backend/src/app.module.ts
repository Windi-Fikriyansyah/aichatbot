import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { GatewayModule } from './gateway/gateway.module';
import { BaileysModule } from './modules/baileys/baileys.module';
import { OpenRouterModule } from './modules/openrouter/openrouter.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { QueueModule } from './modules/queue/queue.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ChatViewerModule } from './modules/chat-viewer/chat-viewer.module';
import { TeamModule } from './modules/team/team.module';
import { BillingModule } from './modules/billing/billing.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    GatewayModule,
    BaileysModule,
    OpenRouterModule,
    OnboardingModule,
    QueueModule,
    CatalogModule,
    AnalyticsModule,
    ChatViewerModule,
    TeamModule,
    BillingModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
