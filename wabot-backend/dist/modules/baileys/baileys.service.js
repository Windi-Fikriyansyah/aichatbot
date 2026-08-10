"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BaileysService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaileysService = void 0;
const common_1 = require("@nestjs/common");
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const prisma_service_1 = require("../../prisma/prisma.service");
const baileys_listener_1 = require("./baileys.listener");
const pino_1 = __importDefault(require("pino"));
let BaileysService = BaileysService_1 = class BaileysService {
    prisma;
    baileysListener;
    sessions = new Map();
    logger = new common_1.Logger(BaileysService_1.name);
    constructor(prisma, baileysListener) {
        this.prisma = prisma;
        this.baileysListener = baileysListener;
    }
    async onModuleInit() {
        const activeSessions = await this.prisma.waSession.findMany({
            where: { status: 'CONNECTED' },
        });
        for (const session of activeSessions) {
            await this.initSession(session.businessAccountId, session.sessionId);
        }
    }
    async initSession(businessAccountId, sessionId) {
        if (this.sessions.has(sessionId)) {
            this.logger.log(`Session ${sessionId} is already running, skipping init.`);
            return;
        }
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(`./sessions/${sessionId}`);
        const pinoLogger = (0, pino_1.default)({ level: 'silent' });
        const sock = (0, baileys_1.default)({
            auth: state,
            printQRInTerminal: false,
            logger: pinoLogger,
            browser: ['WaBot', 'Chrome', '1.0.0'],
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                return { conversation: 'hello' };
            },
        });
        this.sessions.set(sessionId, sock);
        sock.ev.on('creds.update', saveCreds);
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== baileys_1.DisconnectReason.loggedOut;
                this.logger.warn(`Session ${sessionId} closed. Status: ${statusCode}. Reconnect: ${shouldReconnect}`);
                this.sessions.delete(sessionId);
                if (shouldReconnect) {
                    setTimeout(() => {
                        this.initSession(businessAccountId, sessionId);
                    }, 3000);
                }
                else {
                    await this.prisma.waSession.update({
                        where: { sessionId },
                        data: { status: 'DISCONNECTED', qrCode: null },
                    });
                }
            }
        });
        this.baileysListener.bindEvents(sock, businessAccountId, sessionId);
    }
    async restartSession(businessAccountId, sessionId) {
        const existingSock = this.sessions.get(sessionId);
        if (existingSock) {
            try {
                existingSock.end(undefined);
            }
            catch (_e) { }
            this.sessions.delete(sessionId);
        }
        const fs = await import('fs');
        const path = await import('path');
        const sessionDir = path.resolve(`./sessions/${sessionId}`);
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }
        await this.initSession(businessAccountId, sessionId);
    }
    async logoutSession(sessionId) {
        const existingSock = this.sessions.get(sessionId);
        if (existingSock) {
            try {
                existingSock.logout();
            }
            catch (_e) { }
            try {
                existingSock.end(undefined);
            }
            catch (_e) { }
            this.sessions.delete(sessionId);
        }
        const fs = await import('fs');
        const path = await import('path');
        const sessionDir = path.resolve(`./sessions/${sessionId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        if (fs.existsSync(sessionDir)) {
            try {
                await fs.promises.rm(sessionDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
            }
            catch (err) {
                this.logger.error(`Failed to delete session directory: ${err}`);
            }
        }
    }
    async sendMessage(sessionId, toPhone, text) {
        const sock = this.sessions.get(sessionId);
        if (!sock)
            throw new Error('WhatsApp session tidak terhubung');
        const jid = toPhone.includes('@') ? toPhone : `${toPhone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
        this.logger.log(`[DEBUG] Baileys actually sending message to: ${jid}`);
        const msg = await sock.sendMessage(jid, { text: text });
        return msg?.key?.id;
    }
    async sendPresenceUpdate(sessionId, type, toJid) {
        const sock = this.sessions.get(sessionId);
        if (!sock || !sock.authState.creds.me)
            return;
        if (toJid && ["composing", "recording", "paused"].includes(type)) {
            try {
                await sock.sendPresenceUpdate("available");
                await sock.presenceSubscribe(toJid);
            }
            catch (e) {
                this.logger.warn(`[DEBUG] autoSubscribePresence error: ${e}`);
            }
        }
        return sock.sendPresenceUpdate(type, toJid);
    }
    async sendMediaMessage(sessionId, toPhone, mediaUrl, caption) {
        const sock = this.sessions.get(sessionId);
        if (!sock)
            throw new Error('WhatsApp session tidak terhubung');
        const jid = toPhone.includes('@') ? toPhone : `${toPhone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
        const msg = await sock.sendMessage(jid, {
            image: { url: mediaUrl },
            caption: caption
        });
        return msg?.key?.id;
    }
};
exports.BaileysService = BaileysService;
exports.BaileysService = BaileysService = BaileysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        baileys_listener_1.BaileysListener])
], BaileysService);
//# sourceMappingURL=baileys.service.js.map