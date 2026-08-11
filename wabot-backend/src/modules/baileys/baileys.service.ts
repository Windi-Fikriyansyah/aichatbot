import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { PrismaService } from '../../prisma/prisma.service';
import { BaileysListener } from './baileys.listener';
import pino from 'pino';
import { Boom } from '@hapi/boom';

@Injectable()
export class BaileysService implements OnModuleInit {
  public sessions = new Map<string, any>();
  private readonly logger = new Logger(BaileysService.name);

  constructor(
    private prisma: PrismaService,
    private baileysListener: BaileysListener,
  ) {}

  async onModuleInit() {
    const activeSessions = await this.prisma.waSession.findMany({
      where: { status: 'CONNECTED' },
    });
    for (const session of activeSessions) {
      await this.initSession(session.businessAccountId, session.sessionId);
    }
  }

  async initSession(businessAccountId: string, sessionId: string) {
    // If session already running, skip
    if (this.sessions.has(sessionId)) {
      this.logger.log(`Session ${sessionId} is already running, skipping init.`);
      return;
    }

    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);
    
    const pinoLogger = pino({ level: 'silent' });
    
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pinoLogger as any,
      browser: ['WaBot', 'Chrome', '1.0.0'],
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      getMessage: async (key) => {
        return { conversation: 'hello' };
      },
    });
    
    this.sessions.set(sessionId, sock);
    
    sock.ev.on('creds.update', saveCreds);

    // Handle connection lifecycle (reconnect on disconnect)
    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        this.logger.warn(`Session ${sessionId} closed. Status: ${statusCode}. Reconnect: ${shouldReconnect}`);
        
        // Remove the dead session from the map
        this.sessions.delete(sessionId);

        if (shouldReconnect) {
          // Wait a moment, then re-init to get fresh QR
          setTimeout(() => {
            this.initSession(businessAccountId, sessionId);
          }, 3000);
        } else {
          // Logged out: clean up DB status
          await this.prisma.waSession.update({
            where: { sessionId },
            data: { status: 'DISCONNECTED', qrCode: null },
          });

          // Delete stale auth files so next connect generates a fresh QR
          const fs = await import('fs');
          const path = await import('path');
          const sessionDir = path.resolve(`./sessions/${sessionId}`);
          if (fs.existsSync(sessionDir)) {
            try {
              await fs.promises.rm(sessionDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
              this.logger.log(`Cleared invalid session files for ${sessionId}`);
            } catch (err) {
              this.logger.error(`Failed to delete session directory on 401: ${err}`);
            }
          }
        }
      }
    });
    
    // Bind message & QR listeners
    this.baileysListener.bindEvents(sock, businessAccountId, sessionId);
  }

  async restartSession(businessAccountId: string, sessionId: string) {
    // Force-close existing socket if any
    const existingSock = this.sessions.get(sessionId);
    if (existingSock) {
      try { existingSock.end(undefined); } catch (_e) { /* ignore */ }
      this.sessions.delete(sessionId);
    }

    // Delete stale auth files so Baileys generates a fresh QR
    const fs = await import('fs');
    const path = await import('path');
    const sessionDir = path.resolve(`./sessions/${sessionId}`);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }

    // Re-init from scratch
    await this.initSession(businessAccountId, sessionId);
  }

  async logoutSession(sessionId: string) {
    // Force-close existing socket
    const existingSock = this.sessions.get(sessionId);
    if (existingSock) {
      try { existingSock.logout(); } catch (_e) { /* ignore */ }
      try { existingSock.end(undefined); } catch (_e) { /* ignore */ }
      this.sessions.delete(sessionId);
    }

    // Delete auth files so next connect generates a fresh QR
    const fs = await import('fs');
    const path = await import('path');
    const sessionDir = path.resolve(`./sessions/${sessionId}`);
    
    // Give Windows a moment to release file handles
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (fs.existsSync(sessionDir)) {
      try {
        await fs.promises.rm(sessionDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch (err) {
        this.logger.error(`Failed to delete session directory: ${err}`);
      }
    }
  }

  async sendMessage(sessionId: string, toPhone: string, text: string) {
    const sock = this.sessions.get(sessionId);
    if (!sock) throw new Error('WhatsApp session tidak terhubung');
    // toPhone is now a full JID (e.g. 123@s.whatsapp.net or 123@lid)
    const jid = toPhone.includes('@') ? toPhone : `${toPhone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    this.logger.log(`[DEBUG] Baileys actually sending message to: ${jid}`);
    const msg = await sock.sendMessage(jid, { text: text });
    return msg?.key?.id;
  }

  async sendPresenceUpdate(sessionId: string, type: any, toJid?: string) {
    const sock = this.sessions.get(sessionId);
    if (!sock || !sock.authState.creds.me) return;

    if (toJid && ["composing", "recording", "paused"].includes(type)) {
      try {
        await sock.sendPresenceUpdate("available");
        await sock.presenceSubscribe(toJid);
      } catch (e) {
        this.logger.warn(`[DEBUG] autoSubscribePresence error: ${e}`);
      }
    }

    return sock.sendPresenceUpdate(type, toJid);
  }

  async sendMediaMessage(sessionId: string, toPhone: string, mediaUrl: string, caption?: string) {
    const sock = this.sessions.get(sessionId);
    if (!sock) throw new Error('WhatsApp session tidak terhubung');
    const jid = toPhone.includes('@') ? toPhone : `${toPhone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    
    // Asumsi mediaUrl adalah URL gambar publik
    const msg = await sock.sendMessage(jid, { 
      image: { url: mediaUrl }, 
      caption: caption 
    });
    return msg?.key?.id;
  }
}
