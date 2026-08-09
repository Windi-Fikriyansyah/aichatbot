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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OpenRouterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let OpenRouterService = OpenRouterService_1 = class OpenRouterService {
    configService;
    logger = new common_1.Logger(OpenRouterService_1.name);
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('OPENROUTER_API_KEY') || '';
    }
    async generateReply(params) {
        const startTime = Date.now();
        const messages = [
            { role: 'system', content: params.systemPrompt },
            ...params.history,
            { role: 'user', content: params.userMessage },
        ];
        try {
            const response = await axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: params.model || 'anthropic/claude-3.5-sonnet',
                temperature: params.temperature ?? 0.7,
                messages,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://wabot.ai',
                    'X-Title': 'WaBot AI Multi-Tenant',
                    'Content-Type': 'application/json',
                },
            });
            const latencyMs = Date.now() - startTime;
            const reply = response.data.choices[0]?.message?.content || '';
            const tokensUsed = response.data.usage?.total_tokens || 0;
            return { reply, tokensUsed, latencyMs };
        }
        catch (error) {
            this.logger.error('Error calling OpenRouter API:', error.response?.data || error.message);
            throw new Error('Gagal mendapatkan respon dari AI Router.');
        }
    }
};
exports.OpenRouterService = OpenRouterService;
exports.OpenRouterService = OpenRouterService = OpenRouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenRouterService);
//# sourceMappingURL=openrouter.service.js.map