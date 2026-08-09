"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewerModule = void 0;
const common_1 = require("@nestjs/common");
const chat_viewer_service_1 = require("./chat-viewer.service");
const chat_viewer_controller_1 = require("./chat-viewer.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const baileys_module_1 = require("../baileys/baileys.module");
const gateway_module_1 = require("../../gateway/gateway.module");
let ChatViewerModule = class ChatViewerModule {
};
exports.ChatViewerModule = ChatViewerModule;
exports.ChatViewerModule = ChatViewerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, gateway_module_1.GatewayModule, (0, common_1.forwardRef)(() => baileys_module_1.BaileysModule)],
        controllers: [chat_viewer_controller_1.ChatViewerController],
        providers: [chat_viewer_service_1.ChatViewerService]
    })
], ChatViewerModule);
//# sourceMappingURL=chat-viewer.module.js.map