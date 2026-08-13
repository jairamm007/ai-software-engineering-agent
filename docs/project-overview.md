# Repo Verify — AI Software Engineering Agent

## Project Vision

**Repo Verify** is an AI-powered, multi-agent software engineering platform that assists developers throughout the entire software development lifecycle. Instead of acting like a simple chatbot, it behaves like an AI software engineer that can:

- Analyze complete GitHub repositories
- Explain code and answer natural-language questions about a codebase
- Map architecture and dependency graphs
- Review pull requests and detect bugs
- Detect security vulnerabilities
- Generate new features, code, documentation, and unit tests
- Run an automated debug → codegen → security → performance pipeline
- Collaborate with teams and act as an AI pair programmer

---

## Problem Statement

Developers spend a significant amount of time:

- Understanding unfamiliar codebases
- Reading and writing documentation
- Reviewing pull requests and code quality
- Finding and fixing bugs
- Detecting security issues
- Writing repetitive code and tests
- Planning software architecture

Most AI coding assistants only generate code and do not fully understand an entire software project. **Repo Verify** operates at the **repository level** — it ingests the whole codebase (via RAG), reasons about it with multiple specialized agents, and assists developers like an intelligent teammate.

---

## Objectives

The system can:

- Analyze GitHub repositories (public and private, read-only by default)
- Import and index repositories into a searchable knowledge base
- Answer questions about source code using semantic (RAG) search
- Generate new features, APIs, components, and database schemas
- Detect bugs and suggest fixes (automatic debugging pipeline)
- Review code quality and pull requests
- Generate README, API, and architecture documentation
- Generate unit and integration tests
- Run security scans (secret detection, dependency/advisory checks)
- Benchmark performance before/after patches
- Provide repository intelligence (health scores, tech stack, timeline, recommendations)
- Remember previous conversations and work in multi-agent teams
- Let teams collaborate with shared repos, chat, docs, reviews, and notifications

---

## Target Users

- Software Engineers
- Students learning codebases
- Open Source Contributors
- Startup Teams
- Freelance Developers
- Engineering Teams (via the Team Collaboration module)
- Project Maintainers (PR review, CI/CD, branch protection)

---

## Project Type

AI + Multi-Agent Orchestration + Full Stack Web App + RAG + Repo Intelligence + Team Collaboration

---

## Tech Stack

### Frontend (`frontend/`)
- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **Tailwind CSS 4**
- **React Router 7** (lazy-loaded routes, protected/guest/admin guards)
- **Recharts**, **ReactFlow**, **framer-motion**, **dagre** (charts & graphs)
- **react-markdown** + **react-syntax-highlighter** (code rendering)
- **react-hook-form** + **zod** (forms/validation)
- **Axios**, **Better Auth client**, **sonner** (toasts)

### Backend (`backend/`)
- **Node.js + Express 5** + **TypeScript** (ESM)
- **Prisma 7** ORM + **PostgreSQL**
- **Better Auth 1.6** (email/password + Google/GitHub OAuth, email verification, password reset, sessions)
- **Resend** (transactional email)
- **Octokit** (GitHub API integration)
- **LangGraph / LangChain** (agent graph orchestration)
- **simple-git** (repo cloning)

### AI / LLM
Multi-provider router with automatic failover (`LLM_PROVIDER_ORDER`):
- Google **Gemini**
- **Groq**
- **OpenRouter**
- **OpenAI**
- **Cerebras**
- **Together AI**
- **Mistral**
- **Cohere**

### RAG / Vectors
- Repository indexer → parser (AST-based) → chunker → **embeddings** (Gemini/OpenAI) → **pgvector** similarity search
- Semantic search with multi-query expansion and reranking

### Testing
- **Vitest** — 304 unit/integration tests across agents, services, repositories, middleware, RAG, and insights

### Deployment
- Frontend: static build (`vite build`) — Vercel-ready (`vercel.json`)
- Backend: `tsc` build → Node (Render/Railway/VPS compatible)
- PostgreSQL database (managed or self-hosted)
- Email: Resend (verify a domain for production delivery)

---

## Module Map

| Module | Purpose |
|---|---|
| **Auth** | Registration, login, email verification, password reset, Google/GitHub OAuth, sessions (Better Auth) |
| **Repositories** | Import/clone GitHub repos, local path, file index, favorites |
| **Repository Intelligence** | File tree, AST symbols, language stats, complexity, import/call graphs, architecture diagram |
| **RAG / Semantic Search** | Chunked embeddings, similarity + natural-language search |
| **AI Chat** | Conversational agent with repository context and multi-turn memory |
| **Multi-Agent** | 13+ specialized agents orchestrated via LangGraph |
| **Pipeline (Debug/Codegen/Security/Perf)** | End-to-end automated runs with sandboxed test execution |
| **Insights** | Auto-generated architecture/module/dependency/tech-stack reports with health scores + PDF/Markdown export |
| **Code Review** | PR/commit review with issue counts and suggestions |
| **Documentation** | README/API/architecture doc generation |
| **GitHub Integration** | OAuth connect, repo/branch/commit/PR/issue management, CI/CD, branch protection, webhooks, AI PR assistant |
| **Teams** | Team workspace: members, roles, shared repos, chat, discussions, docs, reviews, testing, analytics, notifications |
| **Admin Panel** | 20+ pages: users, repositories, AI services, analytics, security, reports, backup, support, activity logs, settings |
| **Landing / Public** | Marketing pages, FAQ, docs, blog, about, support, privacy, terms |

---

## Current Status

- All core modules implemented and passing: frontend/backend typechecks, production builds, ESLint (0 errors), and 304 backend tests.
- Authentication includes mandatory email verification and password reset (Resend) — working in development with the test sender.
- Repository cloning workspaces are stored in `backend/temp/` (git-ignored) and cleaned from the repo.
- Deployment pending: Resend domain verification + hosting (see `5-roadmap.md`).

---

## Future Scope

- Production email domain (Resend verified domain)
- Deployment/CI-CD agent
- Voice commands
- Multi-repository workspaces
- Model fine-tuning and local model support
