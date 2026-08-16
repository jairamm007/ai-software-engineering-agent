# Software Requirements Specification (SRS)

# Repo Verify — AI Software Engineering Agent

---

## 1. Functional Requirements

### 1.1 Authentication & User Management
- User registration (email + password)
- Mandatory email verification (verification email via Resend, resend button on login/register)
- User login / logout
- Password reset (forgot password → reset email → new password)
- Session management (7-day cookie session, sliding refresh)
- Google and GitHub OAuth sign-in with account linking
- User profile (name, bio, image, banner, LinkedIn/GitHub/portfolio URLs)
- Admin role with `role` field and role-gated admin routes

### 1.2 Repository Management
- Import a GitHub repository (clone into workspace)
- Repository dashboard/list with search, sort, favorites
- Repository detail: overview, files, chat, review, architecture, documentation, dependency graph, intelligence, doc generator, semantic search, multi-agent, settings
- Per-user repository rows (same repo can be imported by many users without collision)

### 1.3 AI Chat
- Chat with repository context
- Context-aware, multi-turn conversations with memory
- Conversation history per user
- Streaming responses

### 1.4 Repository Intelligence
- Repository parsing (AST-based) and indexing
- File tree generation
- Language statistics, complexity analysis
- Import graph / call graph / dependency graph visualization
- Architecture diagram + folder visualization

### 1.5 RAG & Semantic Search
- Chunk files and generate embeddings
- Store in pgvector and run similarity search
- Natural-language search with multi-query expansion
- File / function / class / symbol search

### 1.6 Multi-Agent System
- Planner agent (intent detection)
- Retriever agent (RAG search)
- Reasoner agent (chain-of-thought analysis)
- Answer / code-review / fix / test-generator / security / architecture / documentation / commit-message / pull-request agents
- Agent execution with memory, insights, and timing traces

### 1.7 Automated Pipeline
- Debug stage: run tests, collect failures, diagnose root causes, generate patches, re-test
- Codegen stage: generate features/files
- Security stage: scan for secrets, vulnerabilities, dependency advisories
- Performance stage: baseline vs after-patch benchmarks (time, memory, queries)
- Run history with stage statuses

### 1.8 Code Review
- Pull request and commit review
- Code smell / bug detection
- Best-practice and performance suggestions
- Issue severity counts (critical / warning / info)

### 1.9 Documentation
- README generator with preview
- API documentation generator
- Architecture documentation generator
- Function/class docs

### 1.10 Testing
- Unit test generation
- Integration test suggestions
- Edge-case suggestions

### 1.11 Insights Reports
- Auto-generated: summary, overview, modules, dependencies, tech stack, timeline, recommendations
- Health scoring: documentation, security, performance, maintainability, overall
- PDF and Markdown export

### 1.12 GitHub Integration
- Connect GitHub with OAuth token
- List user repos, branches, commits, PRs, issues
- Create/manage PRs, issues, merge PRs, review PRs
- CI/CD and branch protection support
- Webhook event ingestion
- AI PR assistant (description, review)

### 1.13 Team Collaboration
- Create teams with unique slug + team code
- Member roles: owner / admin / member / viewer with permission hierarchy
- Invitations by email
- Share repositories with a team (read / write / admin)
- Team chat, discussions/comments with mentions
- Shared documentation
- Team code reviews, testing, analytics, activity log, notifications

### 1.14 Admin Panel
- User management (list, role, suspend, delete)
- Repository management
- AI services overview
- Analytics dashboard (Recharts)
- Security overview, notifications, reports
- Settings, admin management, documentation
- Code reviews, testing, search
- Activity logs, backup, support tickets, profile

### 1.15 Email (Resend)
- Verification emails on sign-up and re-send
- Password reset emails
- Sender name: `AI Software Engineering Agent / Repo Verify`
- Dev test sender restricted to the Resend account owner; production requires a verified domain

---

## 2. Non-Functional Requirements

- **Performance**: Fast AI responses with streaming; index/embed asynchronously; pagination on lists
- **Security**: Security headers (CSP, HSTS in prod, etc.), rate limiting, request IDs, encrypted GitHub tokens (AES-256-GCM), hashed passwords via Better Auth, no secrets in repo
- **Reliability**: Health endpoint with DB/memory checks; error middleware; graceful failure of background email
- **Isolation**: Each user's data is scoped by `userId`; teams by `teamId`; admin-only endpoints guarded by `AdminRoute`
- **Scalability**: Modular backend (controllers/routes/services/repositories), provider failover, lazy-loaded frontend routes
- **Maintainability**: Shared types, strict TypeScript, ESLint clean, documented codebase
- **Usability**: Responsive UI, dark/light themes, accent colors, landing page with FAQ/docs
- **Testability**: Vitest unit/integration suites (321 tests)

---

## 3. User Stories

1. As a developer, I want to import a GitHub repo and chat with it so I can understand unfamiliar code.
2. As a developer, I want AI to review my PR and flag bugs/security issues before merge.
3. As a developer, I want to auto-generate README/API docs for my repo.
4. As a team owner, I want to invite members and share repos so we collaborate on reviews.
5. As an admin, I want to manage users and see analytics/activity across the platform.
6. As a user, I want email verification and password reset so my account is secure.
7. As a developer, I want the automated debug → codegen → security → performance pipeline so I can fix and harden my code automatically.

---

## 4. Non-Goals (Current Scope)

- Not a code-completion IDE plugin (unlike Copilot)
- No on-prem/local LLM hosting (yet)
- No multi-database support (PostgreSQL only)
- No marketplace/plugin system
