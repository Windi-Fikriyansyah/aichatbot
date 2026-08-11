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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const baileys_service_1 = require("../baileys/baileys.service");
let OnboardingService = class OnboardingService {
    prisma;
    baileys;
    constructor(prisma, baileys) {
        this.prisma = prisma;
        this.baileys = baileys;
    }
    async startOnboarding(userId, data) {
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
    async getStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { memberships: { include: { businessAccount: true } } }
        });
        return user;
    }
    async createWaSession(tenantId) {
        const sessionId = `sess-${tenantId}`;
        await this.prisma.waSession.upsert({
            where: { sessionId },
            update: {},
            create: {
                businessAccountId: tenantId,
                sessionId,
            }
        });
        await this.baileys.initSession(tenantId, sessionId);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const session = await this.prisma.waSession.findUnique({
            where: { sessionId }
        });
        return session;
    }
    async completeOnboarding(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { onboarded: true }
        });
    }
    async saveAiConfig(tenantId, data) {
        const provider = data.provider || 'openai';
        const model = data.model || 'gpt-4o-mini';
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
    async addCatalog(tenantId, data) {
        return this.prisma.product.create({
            data: {
                businessAccountId: tenantId,
                name: data.name,
                description: data.description,
                price: data.price ? parseFloat(data.price) : null,
            }
        });
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        baileys_service_1.BaileysService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map