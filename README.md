# 🚀 Repo Verify — AI Software Engineering Agent

> 💡 An AI-powered, multi-agent platform that understands complete GitHub repositories, reviews code, detects bugs, finds security vulnerabilities, generates documentation and tests, maps architecture, and helps developers ship faster — like an intelligent teammate.

**🧰 Stack:** React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Express 5 · PostgreSQL · Prisma 7 · Better Auth · Gemini · OpenAI · Groq · 321 tests passing

---

## 📖 Overview

Most AI coding assistants only autocomplete code. **Repo Verify** operates at the **repository level** — it ingests the entire codebase, indexes it with RAG, reasons over it with specialized AI agents, and assists developers across the whole software development lifecycle:

- 📂 **Import** any GitHub repository (public or private)
- 💬 **Chat** with your codebase using natural language
- 🧠 **Multi-Agent AI** — planner, retriever, reasoner, reviewer, fixer, tester, security, architecture, documentation agents
- 🛠️ **Automated Pipeline** — debug → codegen → security → performance in one run
- 📊 **Repository Insights** — health scores, tech stack, modules, dependencies, timeline, recommendations
- 👥 **Team Collaboration** — shared repos, chat, discussions, docs, reviews, notifications
- 🛡️ **Admin Panel** — full platform management

---

## ✨ Key Features

| | Feature | Description |
|---|---|---|
| 🔐 | **Secure Auth** | Email + password, Google/GitHub OAuth, email verification, password reset (Better Auth + Resend) |
| 🗂️ | **Repository Import** | Clone & index any GitHub repo with per-user isolation (no data collisions) |
| 🧠 | **RAG Code Understanding** | AST parsing → chunking → embeddings (Gemini/OpenAI) → pgvector semantic search |
| 💬 | **AI Chat** | Multi-turn, context-aware conversations with repository memory |
| 🤖 | **Multi-Agent Orchestration** | 12 agents (planner, retriever, reasoner + 9 specialized) powered by LangGraph with execution timeline & insights |
| 🛠️ | **Debug Pipeline** | Run tests → collect failures → diagnose root cause → generate patches → re-test |
| 🔒 | **Security Scanning** | Secrets, vulnerabilities, and dependency advisories with findings + blocking |
| ⚡ | **Performance Benchmarks** | Baseline vs. after-patch comparisons (time, memory, query count) |
| 🔍 | **Code Review** | PR/commit review with severity counts and suggestions |
| 📝 | **Doc Generation** | README, API, and architecture docs with preview & PDF/Markdown export |
| 🕸️ | **Visualization** | Architecture diagrams, import/call graphs, dependency graphs (ReactFlow) |
| 📈 | **Insights & Health** | Auto-generated reports + documentation/security/performance/maintainability scores |
| 🐙 | **GitHub Integration** | Branches, commits, PRs, issues, CI/CD, branch protection, webhooks, AI PR assistant |
| 👥 | **Team Workspace** | Members & roles, invitations, shared repos, team chat, docs, reviews, analytics |
| 🛡️ | **Admin Panel** | 20 pages: users, repos, AI services, analytics, security, reports, backup, support |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| ⚛️ React 19 + TypeScript | UI framework & language |
| ⚡ Vite 8 | Build tool |
| 🎨 Tailwind CSS 4 | Styling |
| 🔄 React Router 7 | Routing (lazy-loaded, protected/guest/admin guards) |
| 📡 Axios + TanStack Query | API communication & data fetching |
| 📊 Recharts / 🕸️ ReactFlow | Charts & graph visualization |
| 🎞️ framer-motion | Animations |

### Backend
| Technology | Purpose |
|---|---|
| 🟢 Node.js + Express 5 | Runtime & API framework |
| 📘 TypeScript | Programming language |
| 🐘 PostgreSQL + Prisma 7 | Database & ORM |
| 🔑 Better Auth | Authentication & sessions |
| 🧵 LangGraph / LangChain | Agent orchestration |
| 🐙 Octokit + simple-git | GitHub API & cloning |
| ✉️ Resend | Transactional email |
| ✅ Vitest | Testing (321 tests) |

### AI / LLM
Multi-provider router with automatic failover:
**Google Gemini · Groq · OpenRouter · OpenAI · Cerebras · Together AI · Mistral**

### RAG / Vectors
**AST Parser → Chunker → Embeddings → pgvector similarity search → Context Builder**

---

## 📁 Monorepo Structure

```
ai-software-engineering-agent/
│
├── 📁 frontend/            # React + Vite + Tailwind app
│   ├── 📁 src/pages/       # 81 page components (Dashboard, Repository, Teams, Admin, ...)
│   ├── 📁 src/services/    # Typed API layer
│   ├── 📁 src/context/     # Auth, App, Sidebar, Theme
│   ├── 📁 src/components/  # Reusable UI & feature components
│   ├── 📁 src/router.tsx   # Lazy-loaded route table
│   ├── 📄 vite.config.ts
│   └── 📖 README.md
│
├── 📁 backend/             # Express + Prisma + PostgreSQL API
│   ├── 📁 prisma/          # Schema & migrations (41 models)
│   ├── 📁 src/
│   │   ├── 📁 agents/      # LangGraph agents
│   │   ├── 📁 ai/providers/# LLM provider router
│   │   ├── 📁 auth/        # Better Auth config
│   │   ├── 📁 pipeline/    # Debug/Codegen/Security/Performance
│   │   ├── 📁 modules/insights/
│   │   ├── 📁 rag/         # Chunking & context building
│   │   ├── 📁 repository/  # Data access layer
│   │   ├── 📁 routes/      # Express routes
│   │   └── 📁 __tests__/   # Vitest suites
│   └── 📖 README.md
│
├── 📁 docs/                # Project documentation
│   ├── 📖 project-overview.md
│   ├── 📖 requirements.md
│   ├── 📖 architecture.md
│   ├── 📖 database-design.md
│   ├── 📖 system-design.md
│   └── 📖 commands.md
├── 📄 LICENSE
└── 📖 README.md            # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- ✅ Git
- ✅ Node.js (LTS)
- ✅ npm
- ✅ PostgreSQL
- ✅ Docker (optional, for pipeline sandbox)

### 1️⃣ Database Setup

Create a PostgreSQL database, then configure it in the backend `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_software_engineering_agent?schema=public"
```

### 2️⃣ Backend

```bash
cd backend
npm install
cp .env.example .env     # add your keys (see below)
npx prisma generate
npx prisma migrate dev
npm run dev              # → http://localhost:3000
```

### 3️⃣ Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # → http://localhost:5173
```

Open **http://localhost:5173** — the Vite dev server proxies `/api` to the backend automatically.

---

## 🌍 Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_software_engineering_agent?schema=public"

# Redis (optional, for distributed rate limiting)
REDIS_URL=redis://localhost:6379

# Authentication
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# GitHub token encryption (64-char hex)
GITHUB_TOKEN_ENCRYPTION_KEY=

# AI providers (at least one required)
GEMINI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
OPENAI_API_KEY=
CEREBRAS_API_KEY=
TOGETHER_API_KEY=
MISTRAL_API_KEY=
LLM_PROVIDER_ORDER=gemini,groq,openrouter,openai,cerebras,together,mistral

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM="AI Software Engineering Agent / Repo Verify <onboarding@resend.dev>"

# Error tracking (optional) & logging
SENTRY_DSN=
LOG_LEVEL=info

# Rate limiting (requests per minute)
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000   # leave empty in dev (Vite proxy handles /api)
```

> 📌 **Email note:** Resend's test sender (`onboarding@resend.dev`) only delivers to the email that owns the Resend account. For production, verify a domain at resend.com and update `EMAIL_FROM`.

---

## 📡 API Overview

| Prefix | Purpose |
|---|---|
| `/api/auth` | Register, login, verify email, password reset, OAuth |
| `/api/health` | Health checks (DB + memory) |
| `/api/repository` | Repos, files, dependency graph, intelligence, docs, semantic search |
| `/api/chat` · `/api/conversations` | AI chat & history |
| `/api/agent` · `/api/multi-agent` | Agent & multi-agent execution |
| `/api/user` · `/api/user/preferences` | Profile & preferences |
| `/api/ai-providers` | LLM providers |
| `/api/github*` · `/api/webhooks` · `/api/github/ai-pr` | GitHub integration, webhooks, AI PR assistant |
| `/api/pipeline/runs` · `/api/runs` | Pipeline (debug/codegen/security/perf) |
| `/api/insights` | Repository insights & health reports |
| `/api/teams` | Teams, members, chat, discussions, docs, reviews, analytics, notifications |
| `/api/admin` | Admin panel |

Full details: `docs/system-design.md` and `docs/architecture.md`.

---

## 🧪 Testing

```bash
# Backend (321 Vitest tests)
cd backend && npm test

# Frontend
cd frontend && npx tsc --noEmit   # typecheck
cd frontend && npx eslint .       # lint (0 errors)
cd frontend && npm run build      # production build
```

---

## 🏗️ Architecture in One Picture

```
User ⇄ React Frontend (Vite) ⇄ Express API ⇄ [Auth | Modules | Agents | Pipeline | Insights]
                                              │
                              LangGraph Agents → LLM Router → Gemini/Groq/OpenAI/...
                                              │
                              RAG: AST Parser → Chunker → Embeddings → pgvector
                                              │
                              Prisma → PostgreSQL (per-user / per-team isolation)
```

Each user's data is scoped by `userId`, teams by `teamId`, and compound unique keys prevent cross-user collisions. See `docs/architecture.md` and `docs/database-design.md`.

---

## 🗺️ Roadmap

- ✅ **Phase 1–10**: planning, setup, auth, repositories, intelligence, RAG, agents, chat, pipeline, UI & features
- 🔄 **Phase 11 — Production Readiness**: Resend domain verification, deployment (backend + frontend), OAuth prod credentials, DB backup/monitoring
- ☐ **Phase 12 — Future**: deployment agent, voice commands, multi-repo workspaces, local model support

See `docs/requirements.md` for the full SRS and `docs/system-design.md` for system design.

---

## 📸 Screenshots

📷 Add screenshots or GIFs of the application here to showcase the user experience.

---

## 🤝 Contributors

- 👨‍💻 Jai Ram M

---

## 📜 License

This project is developed for academic and educational purposes.

---

## ⭐ Support

If you find this project helpful, consider giving it a ⭐ Star on GitHub.

🚀 Built with passion by the Repo Verify team.
