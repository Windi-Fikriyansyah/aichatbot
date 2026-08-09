# AGENT_RULES.md — WaBot AI v2.0 Project Rules

> **System Instruction / Rule Set for AI Coding Agents (Cursor, Windsurf, Antigravity, Claude, ChatGPT)**

---

## 1. Core Mandate & Execution Protocol
1. **Primary Goal**: Build and maintain the WaBot AI v2.0 platform in strict alignment with `WaBot_AI_TechSpec_v2`.
2. **Plan First, Code Later**: Always present a concise execution plan and target file list before generating or modifying code. Never jump straight to code without plan approval.
3. **Incremental Implementation**: Write code incrementally per file/module to avoid code truncation and ensure maximum completeness.
4. **Zero Scope Creep**: Do NOT introduce unapproved features, extra NPM packages, or database schema changes outside `TechSpec v2` without explicit approval.

---

## 2. Technical Stack Constraints

| Component | Allowed Tech Stack | Strict Bans / Disallowed |
| :--- | :--- | :--- |
| **Backend** | NestJS 10 + TypeScript 5 + Prisma ORM 5 | Express standalone, Fastify standalone |
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui | Pages Router, Vue, React Class Components |
| **WA Engine** | **Baileys JS (`@whiskeysockets/baileys`)** | **BANNED: Meta WhatsApp Cloud API** |
| **AI Router** | **OpenRouter API (`https://openrouter.ai/api/v1`)** | **BANNED: Direct Anthropic / OpenAI SDK** |
| **Data Store** | PostgreSQL 16 + Redis 7 + BullMQ Queue | MongoDB, MySQL, In-memory queue |

---

## 3. Multi-Tenant Security & Data Isolation
- **Row-Level Tenant Filtering**: Every Prisma DB query MUST include `where: { businessAccountId }` to prevent cross-tenant data leaks.
- **Guard Enforcements**: Endpoints requiring tenant data must be protected with both `JwtAuthGuard` and `TenantAccessGuard`.
- **Baileys Sandboxing**: WhatsApp connection creds must be stored isolately under `./sessions/${sessionId}` and tied to `businessAccountId`.

---

## 4. Pipeline & Queue Architecture
When implementing message handling workflows, adhere strictly to this pipeline:

1. **Inbound WA Message**: Captured by `BaileysService` (`messages.upsert`).
2. **Queue Push**: Job pushed to BullMQ `process-wa-message` with `businessAccountId`, `conversationId`, and `messageContent`.
3. **Context Builder**: Fetch business profile, `customSystemPrompt`, product catalog, and max 10 recent messages.
4. **AI Generation**: Dispatch request to `OpenRouterService` with tenant's configured model (e.g., `anthropic/claude-3.5-sonnet` or `deepseek/deepseek-chat`).
5. **Outbound Dispatch**: Push reply job to `send-wa-reply` queue → `BaileysService.sendMessage()`.
6. **Realtime Update**: Emit Socket.io event to frontend live chat dashboard.

---

## 5. Onboarding Workflow Protocol
All onboarding logic must conform to the 4-step wizard:
- **Step 1**: Business Profile & Operating Hours Setup.
- **Step 2**: Baileys WebSocket QR Code Scan (`SessionStatus: SCAN_QR_NEEDED` → `CONNECTED`).
- **Step 3**: OpenRouter AI Configuration (Model choice, Tone, Custom Prompt).
- **Step 4**: Product Catalog Context Ingestion.
- **Finalize**: Update `User.onboarded = true`.

---

## 6. Prompting Response Format for AI Agent
When responding to any request in this repository:
1. State which section of `TechSpec_v2` is being addressed.
2. Outline the exact files to be created/modified.
3. Show clean, well-typed code adhering to NestJS/Next.js best practices.
4. Confirm multi-tenant safety (`businessAccountId`) in every service/controller function.