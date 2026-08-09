"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const message_processor_1 = require("./message.processor");
const reply_processor_1 = require("./reply.processor");
const prisma_module_1 = require("../../prisma/prisma.module");
const openrouter_module_1 = require("../openrouter/openrouter.module");
const baileys_module_1 = require("../baileys/baileys.module");
const gateway_module_1 = require("../../gateway/gateway.module");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    connection: {
                        host: configService.get('REDIS_HOST', '127.0.0.1'),
                        port: configService.get('REDIS_PORT', 6379),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'process-wa-message',
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'send-wa-reply',
            }),
            prisma_module_1.PrismaModule,
            openrouter_module_1.OpenRouterModule,
            (0, common_1.forwardRef)(() => baileys_module_1.BaileysModule),
            gateway_module_1.GatewayModule
        ],
        providers: [message_processor_1.MessageProcessor, reply_processor_1.ReplyProcessor],
        exports: [bullmq_1.BullModule]
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map