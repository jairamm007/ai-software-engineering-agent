# Repo Verify — System Design

## Overview

Repo Verify is a full-stack, multi-agent AI software engineering platform. A React frontend talks to an Express API backed by PostgreSQL. The backend layers: middleware → routes → controllers → services → repositories (Prisma).

## Modules

### Frontend
- React 19 + TypeScript + Vite + Tailwind CSS 4
- React Router 7 with lazy loading, Protected/Guest/Admin route guards
- Layouts: Public, Dashboard, Repository, Team, Admin, IDE Workspace
- Contexts: Auth (session, verify, password reset, resend verification), App, Sidebar, Theme
- Typed service layer (`src/services/`) over Axios; Better Auth client

### Backend
- Express 5 + TypeScript (ESM), Prisma 7 + PostgreSQL
- Middleware: security headers, compression, CORS, JSON (1mb), request ID, rate limit, request logger, error handler
- Modular routers/controllers/services/repositories (see `backend/src/`)

### Authentication (Better Auth)
- Email + password, Google and GitHub OAuth
- Mandatory email verification (Resend) with auto sign-in after verification
- Password reset flow
- 7-day cookie sessions with 24h sliding refresh

### GitHub Integration
- OAuth connection, repo import (clone via simple-git)
- Branches, commits, PRs (create/merge/review), issues
- CI/CD, branch protection, webhooks, AI PR assistant
- Encrypted PAT storage (AES-256-GCM)

### Repository Parser & Indexer
- Clones repo into `backend/temp/`
- AST parsing, file tree, symbols, chunks
- Indexes files for search and analysis

### RAG Engine
- Chunking → embeddings (Gemini/OpenAI) → pgvector
- Semantic + keyword search, multi-query expansion
- Context builder for agent retrieval

### AI Agents (LangGraph)
- Planner, Retriever, Reasoner, Answer, Code Review, Fix, Test Generator, Security, Architecture, Documentation, Commit Message, Pull Request
- Multi-agent orchestration with shared memory, insights, timing

### AI Providers
- Router with failover: Gemini, Groq, OpenRouter, OpenAI, Cerebras, Together, Mistral, Cohere
- Configurable order via `LLM_PROVIDER_ORDER`

### Pipeline
- Debug, Codegen, Security, Performance stages on a shared sandbox
- Sandbox: Docker, test-runner, repo, diff, stack-detect
- Persisted as `DebugRun` with failures/diagnoses/patches/security/baselines/comparisons

### Insights
- Per-repo generated reports: summary, overview, modules, dependencies, tech stack, timeline, recommendations
- Health scores (doc, security, performance, maintainability, overall)
- PDF + Markdown export

### Teams
- Team workspace with members, roles, invitations, shared repos
- Team chat, discussions/comments, docs, code reviews, testing, analytics, activity, notifications

### Admin Panel
- 20+ pages: dashboard, users, repositories, AI services, analytics, security, notifications, reports, settings, admins, documentation, code reviews, testing, search, activity logs, backup, support, profile

### Email (Resend)
- Verification + password reset emails
- Sender: `AI Software Engineering Agent / Repo Verify`
- Dev: test sender (account-owner only); Prod: verified domain

## Deployment Topology (Target)

```
Browser
   |
   +-- Frontend (Vercel / static host)   [dist/ from vite build]
   |        \ proxy /api -> Backend
   +-- Backend (Render / Railway / VPS)  [dist/ from tsc build]
   |        \ Prisma -> PostgreSQL (managed, e.g. Neon / Supabase / RDS)
   |        \ Resend API (transactional email)
   |        \ LLM provider APIs (Gemini, Groq, OpenAI, ...)
   |        \ GitHub API (Octokit)
   +-- Filesystem: backend/temp/ (clone workspace, git-ignored)
```

Environment variables required: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `FRONTEND_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, at least one LLM key, OAuth `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`, `GITHUB_TOKEN_ENCRYPTION_KEY`.

## Testing & Quality

- Vitest backend suite: 304 tests (agents, services, repositories, middleware, RAG, insights)
- Frontend: ESLint clean, TypeScript strict, production build passes
- Health endpoint: DB connectivity + memory usage

## Security Considerations

- Security headers incl. CSP + HSTS (prod)
- Rate limiting on API
- Request ID correlation logging
- GitHub tokens encrypted at rest
- Session cookies: `secure` in production, SameSite=Lax
- Admin routes role-gated; per-user/team data scoping enforced in repositories
