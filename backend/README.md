# 🚀 Repo Verify Backend — AI Software Engineering Agent

💡 An AI-powered backend that powers the Repo Verify platform. It provides secure authentication, GitHub repository analysis, RAG-powered code understanding, multi-agent AI orchestration, automated debug/codegen/security/performance pipelines, repository insights, team collaboration, and email notifications.

## 📖 Overview

The Repo Verify Backend is a RESTful API built to power the Repo Verify platform. It securely manages authentication, GitHub repository import & indexing, AI-driven code analysis, multi-agent orchestration, semantic search over codebases, automated pipelines, repository insights, team collaboration, and transactional email.

## ✨ Features

- 🔐 Secure User Authentication (email/password + Google/GitHub OAuth)
- 📧 Email Verification & Password Reset
- 📂 GitHub Repository Import, Cloning & Indexing
- 🧠 RAG-Powered Code Understanding & Semantic Search
- 🤖 Multi-Agent AI System (LangGraph, 12 agents)
- 🔍 AI Code Review & Bug Detection
- 🛠️ Automated Debug → Codegen → Security → Performance Pipeline
- 🛡️ Security Scanning (secrets, vulnerabilities, advisories)
- 📊 Repository Insights & Health Scoring (PDF/Markdown export)
- 📝 Documentation & Test Generation
- 👥 Team Collaboration (members, roles, shared repos, chat, notifications)
- ⚡ RESTful APIs
- 🗄️ PostgreSQL Database Integration (Prisma, per-user data isolation)
- 📈 Health Checks (database + memory)

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| 🟢 Node.js | Runtime Environment |
| ⚡ Express.js 5 | Backend Framework |
| 📘 TypeScript | Programming Language |
| 🐘 PostgreSQL | Database |
| 🔷 Prisma 7 ORM | Database ORM (41 models) |
| 🔑 Better Auth | Authentication (email/password, OAuth, email verification) |
| 🤖 Google Gemini | AI Services (embeddings + LLM) |
| 🧠 OpenAI | AI Processing (embeddings + LLM) |
| 🚀 Groq | AI Inference (LLM) |
| 🌐 OpenRouter / Cerebras / Together / Mistral | Additional LLM providers with automatic failover |
| 🧵 LangGraph / LangChain | Agent Orchestration |
| 🐙 Octokit + simple-git | GitHub API & repository cloning |
| 🐳 Docker | Containerization (pipeline sandbox) |
| ✉️ Resend | Transactional Email |
| ✅ Vitest | Testing (321 tests) |

## 📂 Project Structure

```
backend/
│
├── 📁 prisma/                 # Prisma schema & migrations
├── 📁 src/
│   ├── 📁 agents/             # LangGraph agents (planner, retriever, reasoner, answer, ...)
│   ├── 📁 ai/providers/       # LLM provider router (Gemini, Groq, OpenAI, ...)
│   ├── 📁 auth/               # Better Auth config, middleware, routes
│   ├── 📁 controllers/        # HTTP controllers
│   ├── 📁 database/           # Prisma client
│   ├── 📁 embeddings/         # Embedding generation
│   ├── 📁 github/             # GitHub clone & API utilities
│   ├── 📁 indexer/            # Repository indexing
│   ├── 📁 middleware/         # Security, rate limit, logging, error handling
│   ├── 📁 modules/insights/   # Insights generators & PDF/Markdown export
│   ├── 📁 parser/             # AST-based repository parsing
│   ├── 📁 pipeline/           # Debug/Codegen/Security/Performance pipeline + sandbox
│   ├── 📁 prompts/            # Agent prompt templates
│   ├── 📁 rag/                # Chunking & context building
│   ├── 📁 repository/         # Data access repositories
│   ├── 📁 routes/             # Express route definitions
│   ├── 📁 services/           # Business logic services
│   ├── 📁 tools/              # Agent tool definitions
│   ├── 📁 types/              # Shared TypeScript types
│   ├── 📁 utils/              # Encryption, API responses, helpers
│   ├── 📁 validators/         # Zod request validation
│   ├── 📁 vector/             # pgvector repository
│   ├── 📁 __tests__/          # Vitest test suites
│   ├── app.ts                 # Express app (middleware + route mounting)
│   └── index.ts               # Server entry point
├── 📦 package.json
├── ⚙️ tsconfig.json
├── ⚙️ prisma.config.ts
├── ⚙️ vitest.config.ts
├── 🐳 Dockerfile
└── 📘 README.md
```

## ⚙️ Prerequisites

Before running the project, install:

- ✅ Git
- ✅ Node.js (LTS)
- ✅ npm
- ✅ PostgreSQL
- ✅ Docker (Optional, for pipeline sandbox)

## 📥 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-org>/ai-software-engineering-agent.git
```

### 2️⃣ Navigate to the Backend

```bash
cd ai-software-engineering-agent/backend
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root and add all the required environment variables (see below). A template is available at `.env.example`.

### 5️⃣ Generate Prisma Client

```bash
npx prisma generate
```

### 6️⃣ Run Database Migration

```bash
npx prisma migrate dev
```

or

```bash
npx prisma db push
```

### 7️⃣ Start Development Server

```bash
npm run dev
```

The API runs at `http://localhost:3000` (health check: `GET /api/health`).

## 📡 API Modules

- 🔐 **Authentication** — `/api/auth` (register, login, logout, verify-email, send-verification-email, request-password-reset, reset-password, session)
- ❤️ **Health** — `/api/health` (database + memory checks)
- 🐙 **GitHub** — `/api/github` (parse, clone), `/api/github-integrations` (connect, repos, branches, commits, PRs, issues, CI/CD, branch protection), `/api/webhooks`, `/api/github/ai-pr`
- 📂 **Repository Management** — `/api/repository` (CRUD, analytics, favorite, reindex, analyze) + dependency graph + intelligence + documentation generator + semantic search
- 💬 **AI Chat** — `/api/chat` (single + stream), `/api/conversations`
- 🤖 **Agents** — `/api/agent`, `/api/multi-agent` (orchestration, metadata, tools, memory)
- 👤 **User Management** — `/api/user` (profile, account, password, export, cache, banner), `/api/user/preferences`
- 🧠 **AI Providers** — `/api/ai-providers`
- 🛠️ **Pipeline** — `/api/pipeline/runs`, `/api/runs` (debug / codegen / security / performance runs)
- 📊 **Insights** — `/api/insights` (repository insights, refresh, export, report download)
- 👥 **Teams** — `/api/teams` (members, invitations, repositories, documents, code reviews, test reports) + comments, activities, team-chat, team-notification, team-analytics
- 🛡️ **Admin** — `/api/admin` (users, repositories, AI stats, analytics, security, docs, reviews, tests, notifications, support, settings, health, activity logs, backups, reports, profile)

## 🌍 Environment Variables

Create a `.env` file with the required values:

```env
PORT=3000
NODE_ENV=development

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ai_software_engineering_agent
POSTGRES_PORT=5432
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_software_engineering_agent?schema=public"

# Redis (optional, for distributed rate limiting)
REDIS_URL=redis://localhost:6379

# Authentication
BETTER_AUTH_SECRET=change-me-to-a-secure-random-string
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# GitHub Token Encryption (AES-256-GCM, 64-char hex)
GITHUB_TOKEN_ENCRYPTION_KEY=

# AI Providers (at least one)
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

# Frontend
VITE_API_URL=http://localhost:3000

# Error Tracking (Sentry, optional)
SENTRY_DSN=

# Logging (debug | info | warn | error)
LOG_LEVEL=info

# Rate Limiting (requests per minute)
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
```

## 🧪 Testing

```bash
npm test
```

Runs the Vitest suite (321 tests) covering agents, services, repositories, middleware, RAG, and insights.

## 🤝 Contributors

- 👨‍💻 Jai Ram M

## 📜 License

This project is developed for academic and educational purposes.

## ⭐ Support

If you find this project helpful, consider giving it a ⭐ Star on GitHub.

🚀 Built with passion by the Repo Verify team.
