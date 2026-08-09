"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaileysModule = void 0;
const common_1 = require("@nestjs/common");
const baileys_service_1 = require("./baileys.service");
const baileys_listener_1 = require("./baileys.listener");
const prisma_module_1 = require("../../prisma/prisma.module");
const gateway_module_1 = require("../../gateway/gateway.module");
const queue_module_1 = require("../queue/queue.module");
let BaileysModule = class BaileysModule {
};
exports.BaileysModule = BaileysModule;
exports.BaileysModule = BaileysModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, gateway_module_1.GatewayModule, (0, common_1.forwardRef)(() => queue_module_1.QueueModule)],
        providers: [baileys_service_1.BaileysService, baileys_listener_1.BaileysListener],
        exports: [baileys_service_1.BaileysService],
    })
], BaileysModule);
//# sourceMappingURL=baileys.module.js.map