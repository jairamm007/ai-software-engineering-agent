# Repo Verify — System Architecture

## High-Level Architecture

```
                       User
                        |
         +------------------------------+
         |   React + TypeScript (Vite)  |
         |   Public / Auth / Dashboard  |
         |   Repository / Team / Admin  |
         +--------------+---------------+
                        |  HTTPS  (dev: Vite proxy /api -> :3000)
         +--------------v---------------+
         |       Express.js API         |
         |   security headers -> rate   |
         |   limit -> request ID -> log |
         |   Routers -> Controllers ->  |
         |   Services -> Repositories   |
         +---+----------------+---------+
             |                |
+------------v-----+  +------v-----------------+
|  Better Auth     |  |  Business Modules       |
|  sessions, email |  |  Agents, RAG, Pipeline, |
|  verify, OAuth   |  |  Insights, GitHub,      |
|  (Prisma/Postgres|  |  Teams, Admin           |
+------------+-----+  +------+-----------------+
             |                |
             +----+-----+-----+
                  |     |
          +-------v-+  +v------------+
          |  Prisma + PostgreSQL     |
          |  (per-user / per-team    |
          |   data isolation)        |
          +--------------------------+
```

## Backend Layering

Requests flow through a strict layered architecture:

```
Routes (Express)
   -> Validators (zod)
   -> Controllers (HTTP in/out)
   -> Services (business logic, AI/LLM)
   -> Repositories (Prisma data access)
   -> PostgreSQL (single DB, user-scoped rows)
```

Key cross-cutting concerns are applied in `app.ts` middleware:
- `compression`, `cors`, `express.json({ limit: "1mb" })`
- `securityHeaders` (CSP, HSTS in prod, X-Frame-Options, etc.)
- `requestIdMiddleware` (x-request-id)
- `rateLimiter`
- `requestLogger`
- `errorHandler` (last)

### API Route Mounts (backend `src/app.ts`)

| Prefix | Purpose |
|---|---|
| `/api/auth` | Better Auth (login, register, verify-email, send-verification-email, request-password-reset, reset-password, session) |
| `/api/health` | Health checks (DB + memory) |
| `/api/github` | GitHub proxy (repos, branches, commits, PRs, issues) |
| `/api/repository` | Repositories + dependency graph + intelligence + doc generator + semantic search |
| `/api/chat` | AI chat |
| `/api/conversations` | Conversation/message persistence |
| `/api/agent` | Agent execution |
| `/api/user`, `/api/user/preferences` | User profile and preferences |
| `/api/ai-providers` | Available LLM providers + settings |
| `/api` (multi-agent, team, comment, activity, team-chat, team-notification, team-analytics, github-integration, webhook, ai-pr-assistant, admin, pipeline, insights) | Remaining business modules |

## AI / Agent Subsystem

```
Query / Task
   -> LangGraph Graph (state machine)
        Planner Agent      (intent: review/test/security/architecture/docs/commit/PR/fix/explain/answer)
        Retriever Agent    (RAG search if repository context needed)
        Specialized Agents (reasoner, answer, code-review, fix, test-generator,
                            security, architecture, documentation, commit-message, pull-request)
   -> Agent Executor (memory, insights, tool calling, timing trace)
   -> LLM Provider Router (Gemini / Groq / OpenRouter / OpenAI / Cerebras /
                           Together / Mistral / Cohere) with failover
```

### Agents (backend `src/agents/`)

- `planner.agent.ts` — intent classification, subtasks, confidence
- `retriever.agent.ts` — vector/RAG retrieval
- `reasoner.agent.ts` — chain-of-thought analysis of retrieved chunks
- `answer.agent.ts` — conversational answers
- `code-review.agent.ts` — dimensioned code review
- `fix.agent.ts` — bug fixes
- `test-generator.agent.ts` — unit/integration tests
- `security.agent.ts` — vulnerability review
- `architecture.agent.ts` — architecture analysis
- `documentation.agent.ts` — docs generation
- `commit-message.agent.ts` — conventional commit messages
- `pull-request.agent.ts` — PR descriptions

Multi-agent orchestration (`multi-agent.service.ts`) can run several agents with shared memory, execution timeline, and performance metrics.

## RAG / Semantic Search Subsystem

```
Repository (clone)
  -> indexer (repository.indexer.ts)
  -> parser (AST-based: ast.parser.ts)
  -> chunker (rag/chunker.ts)
  -> embeddings (Gemini / OpenAI via embeddings/embedding.service.ts)
  -> pgvector (vector/vector.repository.ts)
  -> semantic search (services/semantic-search.service.ts, search.service.ts)
```

Search supports file/function/class search plus natural-language queries with multi-query expansion, reranking, and grouped-by-file context building.

## Pipeline Subsystem (Debug / Codegen / Security / Performance)

A `DebugRun` drives four stages with a shared repository sandbox:

```
Debug   -> run tests, collect DebugFailure[]
          -> diagnose (Diagnosis[]), generate Patch[], re-run
Codegen -> generate features/files
Security-> SecurityScanResult (secrets, advisories) with findings + blocked flag
Performance -> PerfBaseline (pre/post) + PerfComparison (time/mem/queries)
```

Sandbox utilities: `docker.ts`, `test-runner.ts`, `repo.ts`, `diff.ts`, `stack-detect.ts`, `ast-context.ts`. Runs are persisted per user with `DebugRun` and related models.

## Insights Subsystem

`ProjectInsights` is generated per repository:

- summary / overview / modules / dependencies / tech stack / timeline / recommendations
- health scores (doc, security, performance, maintainability, overall)
- PDF + Markdown export (`modules/insights/export/`)

## Frontend Architecture

- `src/router.tsx` — single `createBrowserRouter` with lazy-loaded pages
  - Public routes (`PublicLayout`): `/`, `/faq`, `/docs`, `/blog`, `/changelog`, `/support`, `/about`, `/careers`, `/privacy`, `/terms`
  - Guest routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
  - Protected routes (`ProtectedRoute`): dashboard, chat, runs, repositories, teams, insights, profile, settings, etc.
  - Admin routes (`AdminRoute`): `/admin/*` (20+ pages)
- Layouts: `PublicLayout`, `AdminLayout`, `TeamLayout`, `RepositoryLayout`, `DashboardLayout`, `IDEWorkspaceLayout`, `MainLayout`
- State: `AuthContext` (session + callbacks), `AppContext`, `SidebarContext`, `ThemeContext`
- Data access: typed service modules under `src/services/` + `axios`

## Authentication Flow

1. Register → Better Auth creates user (`emailVerified: false`) and sends verification email (Resend).
2. User clicks link → `GET /api/auth/verify-email?token=...` (via frontend `/verify-email`) → user verified and auto signed-in (session cookies `asea.session_token`, `asea.session_data`).
3. Login with password or Google/GitHub OAuth → session cookie.
4. Forgot password → `POST /api/auth/request-password-reset` → reset email → `/reset-password?token=...` → `POST /api/auth/reset-password`.
5. Unverified users can resend verification (button on login/register).

Email is delivered by **Resend** with sender `AI Software Engineering Agent / Repo Verify <onboarding@resend.dev>` in dev (test sender — only reaches the Resend account owner). In production a verified domain must be used.

## Technology Flow

```
Frontend (Vite) -> Express API -> Auth / Modules -> Agents -> Tools -> RAG -> LLM -> Response
```

## Data Isolation Model

Single PostgreSQL database, but every row is owned:

- User-owned: `Repository`, `Conversation`, `Message`, `UserPreference`, `GitHubIntegration`, `DebugRun` (+ children), `SupportMessage` — all have `userId`
- Team-owned: `Team`, `TeamMember`, `TeamRepository`, `TeamActivity`, `Comment`, `SharedDocument`, `TeamChat`, `TeamMessage`, `TeamNotification` — all have `teamId`
- Global/admin: `AuditLog`, `Notification`, `SystemSetting`, `BackupRecord`

Collision avoidance: `@@unique([githubUrl, userId])` on Repository and `@@unique([userId, githubUrl])` on GitHubIntegration mean two users importing the same GitHub repo each get their own row.
