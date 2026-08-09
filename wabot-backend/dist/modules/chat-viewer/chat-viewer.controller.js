"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewerController = void 0;
const common_1 = require("@nestjs/common");
const chat_viewer_service_1 = require("./chat-viewer.service");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const tenant_access_guard_1 = require("../../guards/tenant-access.guard");
let ChatViewerController = class ChatViewerController {
    chatViewerService;
    constructor(chatViewerService) {
        this.chatViewerService = chatViewerService;
    }
    getConversations(tenantId) {
        return this.chatViewerService.getConversations(tenantId);
    }
    getMessages(tenantId, id) {
        return this.chatViewerService.getMessages(tenantId, id);
    }
    updateStatus(tenantId, id, status) {
        return this.chatViewerService.updateConversationStatus(tenantId, id, status);
    }
    reply(tenantId, id, data) {
        return this.chatViewerService.replyToConversation(tenantId, id, data.content, data.mediaUrl);
    }
};
exports.ChatViewerController = ChatViewerController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChatViewerController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChatViewerController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Put)('conversations/:id/status'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ChatViewerController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('conversations/:id/reply'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ChatViewerController.prototype, "reply", null);
exports.ChatViewerController = ChatViewerController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_access_guard_1.TenantAccessGuard),
    (0, common_1.Controller)('api/chat'),
    __metadata("design:paramtypes", [chat_viewer_service_1.ChatViewerService])
], ChatViewerController);
//# sourceMappingURL=chat-viewer.controller.js.map