import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from '../baileys/baileys.service';

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private baileys: BaileysService,
  ) {}

  async startOnboarding(userId: string, data: any) {
    const business = await this.prisma.businessAccount.create({
      data: {
        name: data.name,
        slug: data.slug || `biz-${Date.now()}`,
        category: data.category,
        operatingHours: data.operatingHours,
        escalationPhone: data.escalationPhone,
        members: {
          create: {
            userId: userId,
            role: 'OWNER'
          }
        }
      }
    });
    return business;
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: { include: { businessAccount: true } } }
    });
    return user;
  }

  async createWaSession(tenantId: string) {
    const sessionId = `sess-${tenantId}`;
    
    // Upsert session record in DB
    await this.prisma.waSession.upsert({
      where: { sessionId },
      update: {},
      create: {
        businessAccountId: tenantId,
        sessionId,
      }
    });
    
    // Init Baileys (will skip if already running)
    await this.baileys.initSession(tenantId, sessionId);

    // Give Baileys a moment to generate QR or detect existing connection
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Re-fetch session from DB (now has qrCode or CONNECTED status)
    const session = await this.prisma.waSession.findUnique({
      where: { sessionId }
    });

    return session;
  }

  async completeOnboarding(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { onboarded: true }
    });
  }

  async saveAiConfig(tenantId: string, data: any) {
    // Extract provider from model string (e.g. "anthropic/claude-3.5-sonnet" → "anthropic")
    const provider = data.provider || (data.model?.split('/')[0]) || 'openrouter';
    const model = data.model || 'anthropic/claude-3.5-sonnet';

    return this.prisma.aiConfig.upsert({
      where: { businessAccountId: tenantId },
      update: {
        provider,
        model,
        language: data.language || 'id',
      },
      create: {
        businessAccountId: tenantId,
        provider,
        model,
        language: data.language || 'id',
        baseSystemPrompt: `Anda adalah admin online untuk {{nama_bisnis}}, seorang sales representative yang ramah, cekatan, dan berpengalaman closing lewat WhatsApp.
Gunakan bahasa {{bahasa}} dengan gaya komunikasi {{gaya_bahasa}}, natural seperti manusia asli — BUKAN seperti robot/FAQ bot.

PERAN & TUJUAN UTAMA:
- Tujuan Anda bukan cuma menjawab pertanyaan, tapi mengarahkan pembeli sampai transaksi/closing.
- Selalu proaktif: setelah menjawab, arahkan ke langkah berikutnya (mis. tanya ukuran/warna, tawarkan checkout, minta alamat, dsb).
- Kalau customer terlihat ragu atau baru tanya-tanya, gali kebutuhannya dengan 1 pertanyaan singkat, jangan cuma jawab lalu diam.

TEKNIK CLOSING:
- Ciptakan urgensi secara jujur bila relevan (stok terbatas, promo mau habis) — jangan mengarang informasi yang tidak ada di data.
- Saat customer keberatan soal harga/pengiriman/dll, jangan langsung setuju atau menyerah — jelaskan value/manfaat produk dengan singkat, lalu tawarkan solusi (opsi cicilan, produk alternatif, promo).
- Gunakan pertanyaan tertutup untuk mempercepat keputusan, contoh: "Mau saya siapkan yang warna hitam atau putih, kak?" bukan "Ada yang bisa dibantu lagi?"
- Setelah customer setuju/tertarik, langsung arahkan ke langkah checkout/pembayaran sesuai Alur Pemesanan di bawah.

ATURAN FORMAT PESAN (WhatsApp):
- Balasan singkat, padat, maksimal 3-5 kalimat per pesan kecuali diminta detail.
- Boleh pakai emoji secukupnya agar terasa hangat, jangan berlebihan.
- Hindari format markdown seperti #, **, bullet formal — tulis seperti chat biasa.

BATASAN & KEJUJURAN (WAJIB):
- JANGAN PERNAH mengarang harga, stok, nama produk, atau kebijakan yang tidak ada di data di bawah ini.
- Jika informasi tidak tersedia di data, katakan akan dicek/dikonfirmasi oleh admin, jangan menebak.
- Jika pertanyaan di luar topik bisnis atau termasuk PANTANGAN, alihkan dengan sopan tanpa membahasnya.
`
      }
    });
  }

  async addCatalog(tenantId: string, data: any) {
    return this.prisma.product.create({
      data: {
        businessAccountId: tenantId,
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
      }
    });
  }
}
