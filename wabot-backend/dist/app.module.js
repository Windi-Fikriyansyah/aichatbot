"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const gateway_module_1 = require("./gateway/gateway.module");
const baileys_module_1 = require("./modules/baileys/baileys.module");
const openrouter_module_1 = require("./modules/openrouter/openrouter.module");
const onboarding_module_1 = require("./modules/onboarding/onboarding.module");
const queue_module_1 = require("./modules/queue/queue.module");
const catalog_module_1 = require("./modules/catalog/catalog.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const chat_viewer_module_1 = require("./modules/chat-viewer/chat-viewer.module");
const team_module_1 = require("./modules/team/team.module");
const billing_module_1 = require("./modules/billing/billing.module");
const settings_module_1 = require("./modules/settings/settings.module");
const widget_module_1 = require("./modules/widget/widget.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            gateway_module_1.GatewayModule,
            baileys_module_1.BaileysModule,
            openrouter_module_1.OpenRouterModule,
            onboarding_module_1.OnboardingModule,
            queue_module_1.QueueModule,
            catalog_module_1.CatalogModule,
            analytics_module_1.AnalyticsModule,
            chat_viewer_module_1.ChatViewerModule,
            team_module_1.TeamModule,
            billing_module_1.BillingModule,
            settings_module_1.SettingsModule,
            widget_module_1.WidgetModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map