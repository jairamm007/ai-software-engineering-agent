# Repo Verify — User Guide

Welcome to **Repo Verify**, your AI-powered software engineering platform. Repo Verify combines a multi-agent AI system with repository intelligence so you can understand, analyze, review, document, test, and improve any codebase — alone or with your team.

This guide walks through every feature, how to use it, and the key commands available throughout the app.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Your Account & Profile](#your-account--profile)
3. [Navigating the App](#navigating-the-app)
4. [Dashboard](#dashboard)
5. [Repositories](#repositories)
6. [The Repository Workspace](#the-repository-workspace)
7. [AI Chat](#ai-chat)
8. [Search](#search)
9. [Runs & the Analysis Pipeline](#runs--the-analysis-pipeline)
10. [Code Review](#code-review)
11. [Architecture](#architecture)
12. [Documentation](#documentation)
13. [Testing](#testing)
14. [Analytics](#analytics)
15. [Dependency Graph](#dependency-graph)
16. [Intelligence](#intelligence)
17. [Semantic Search](#semantic-search)
18. [Multi-Agent Tools](#multi-agent-tools)
19. [Insights](#insights)
20. [GitHub Integration](#github-integration)
21. [Teams & Collaboration](#teams--collaboration)
22. [Favorites & History](#favorites--history)
23. [Settings](#settings)
24. [Admin Panel](#admin-panel)
25. [Key Commands](#key-commands)
26. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Getting Started

### Sign Up

1. Open the app and click **Register**.
2. Enter your **name**, **email**, and **password** (or use **Google** / **GitHub** OAuth).
3. Check your inbox and click the **Verify Email** link we send you. You must verify your email before you can sign in.
   - Didn't get the email? On the **Login** page, use the **"Resend verification email"** link, or click **Resend** from the verification screen.
4. Return to the app and sign in.

### Sign In

- Enter your email and password on the **Login** page.
- Enable **Remember me** to keep your session active for 7 days.
- Use **Google** or **GitHub** to sign in with a social account.
- Forgot your password? Click **Forgot password**, enter your email, and follow the reset link (valid for 1 hour).

> Your session stays active for 7 days and refreshes automatically while you use the app.

---

## Your Account & Profile

Open your **Profile** page (top-right avatar → **Profile**) to manage:

- **Name, email, and bio**
- **Banner image** — upload a header image (max 5 MB, JPG/PNG/WebP)
- **Social links** — LinkedIn, GitHub, and portfolio URLs
- **GitHub** — connect or disconnect your GitHub account
- **Change password** — requires your current password
- **Delete account** — permanently removes your account and data

Use **Settings** (top-right avatar → **Settings**) to personalize the app (see [Settings](#settings)).

---

## Navigating the App

The **sidebar** on the left groups everything into sections:

| Section | Pages |
|---|---|
| **Main** | Dashboard, Repositories, GitHub, Teams, AI Chat, Search |
| **AI Development** | Runs, Insights |
| **Analysis** | Documentation, Code Review, Architecture |
| **Quality** | Testing, Analytics |
| **Personal** | Favorites, History |

The **top bar** shows the current page, a **theme toggle** (light/dark), and your **profile menu** (Profile / Settings / Logout).

**Sidebar modes:** click the collapse button to switch between **expanded**, **icons-only**, and **hidden** sidebar.

---

## Dashboard

The Dashboard is your home screen. From here you can:

- See an overview of your repositories and recent activity
- Jump straight into any tool: AI Chat, Code Review, Documentation, Testing, and more
- Quickly add a new repository
- Open the AI Search box to ask questions about your codebases

---

## Repositories

The **Repositories** page lists every repository you can work with.

### Import a Repository

1. Click **Add Repository** (the **+** button).
2. Paste a **GitHub repository URL** (e.g. `https://github.com/octocat/Hello-World`). The URL must be a valid GitHub URL.
3. The repository is cloned and indexed so all AI tools can understand it.

### Managing Repositories

- **Search** repositories by name (results update as you type).
- **Sort** by newest, oldest, name, or number of files.
- Click a repository to open its full workspace.
- **Delete** a repository from its workspace when you no longer need it.

---

## The Repository Workspace

Opening a repository takes you to a full IDE-style workspace with a **file explorer** on one side and a **preview/content panel** on the other. Everything you need for that repo lives in the **tabs** at the top:

| Tab | What it does |
|---|---|
| **Overview** | High-level summary of the repository |
| **Files** | Browse and read every file in the repo |
| **AI Chat** | Chat about this specific repository (see [AI Chat](#ai-chat)) |
| **Review** | AI code review for the whole repo or specific files |
| **Architecture** | See how files are organized into layers and components |
| **Documentation** | Generate docs for files, scopes, or the whole repo |
| **Dependency Graph** | Interactive map of import relationships between files |
| **Intelligence** | Deep analysis: folders, languages, complexity, call graphs |
| **Doc Generator** | Create README, API docs, function docs, or architecture docs |
| **Search** | Semantic search across this repo's code |
| **Multi-Agent** | Run coordinated multi-agent workflows (review, audit, tests, docs…) |
| **Settings** | Repository-specific settings and delete option |

### File Explorer Shortcuts

- Click any file to view its contents.
- Select a file, then use the **AI actions** in the toolbar to **Explain**, **Review**, **Fix**, or **Test** that file.
- Use the **command palette** (see [Key Commands](#key-commands)) for fast actions on the selected file.

---

## AI Chat

The **AI Chat** page is your assistant for anything code-related.

### How to use it

1. (Optional) Choose a **repository** from the selector to give the AI full context of that codebase.
2. Pick a **prompt category** to get started:
   - **Understand** — explain how something works
   - **Analyze** — dig into design, complexity, or risks
3. Type your question and press **Enter**.
4. The AI **streams** its answer live. Results render with **markdown** formatting and can include **code blocks**.
5. Ask follow-up questions — the conversation keeps context.

### Conversation Management

- **Rename** a conversation (click the pencil icon, press **Enter** to save, **Esc** to cancel).
- **Delete** a conversation.
- **Export** a conversation as **plain text, PDF, Markdown, or Word** document.
- **Generate test files** for code the AI produces, right from the chat.

---

## Search

The **Search** page is natural-language search across all your repositories.

- Type a plain-English question (e.g. *"Where is the login handler?"*).
- Switch between result tabs: **All**, **Files**, **Functions**, and **Repositories**.
- Results are AI-ranked so the most relevant code appears first.
- Press **Enter** in the search box to run a search.

---

## Runs & the Analysis Pipeline

**Runs** let you run Repo Verify's analysis pipeline against any repository URL.

### Starting a Run

1. Go to **Runs → New Run**.
2. Enter a **repository URL** and optional **branch**.
3. Submit — the pipeline processes the repo through four stages in order:

| Stage | Purpose |
|---|---|
| **1. Debugging** | Find and explain bugs |
| **2. Codegen** | Generate improvements and fixes |
| **3. Security** | Detect vulnerabilities and security issues |
| **4. Performance** | Identify performance bottlenecks |

4. The run page **auto-refreshes every 2 seconds** so you watch progress live.

### Run Statuses

Each run and stage shows a status: `queued` → `running` → `done`, or `failed` / `rejected` / `blocked` if something went wrong. Open any finished run to see its detailed results.

---

## Code Review

The **Code Review** page runs AI reviews on your code.

1. Choose a **scope**: an entire repository or a specific file.
2. Start the review — the AI checks correctness, security, readability, and best practices.
3. Review the findings with explanations and suggested fixes.
4. Your **review history** is kept so you can revisit past reviews.

Repository reviews are also available in the repo workspace (**Review** tab) and from file actions.

---

## Architecture

The **Architecture** page shows the high-level structure of your code:

- **Layer categorization** — files grouped into layers (UI, API, services, data, etc.)
- **Architecture tree** — a visual breakdown of components and their relationships
- In the repository workspace, you can also run **per-file architecture analysis** with AI explanations.

---

## Documentation

Repo Verify generates documentation for you.

### Dashboard Documentation page

Pick one of six categories:

- **Auto** — automatically choose the best docs
- **README** — project readme
- **API** — endpoint reference
- **Architecture** — system structure
- **Database** — schema and data model
- **Routes** — route/endpoint map

### In the Repository Workspace

The **Documentation** tab supports three scopes:

- **Single** — document one file
- **Multiple** — document selected files
- **Entire repo** — generate a full set of docs

The **Doc Generator** tab specializes in **README**, **API Docs**, **Functions & Classes**, and **Architecture** documents.

---

## Testing

The **Testing** page generates AI-written tests:

- **Unit tests** for functions and logic
- **Integration tests** for end-to-end flows
- Choose the target file or scope and let the AI produce runnable test code.
- Generate test files directly from **AI Chat** too.

---

## Analytics

The **Analytics** page gives you charts about your code:

- **File extension breakdown** — what kinds of files make up your repos
- **Language distribution** — which languages you use and how much
- Detailed metrics per repository in the workspace

---

## Dependency Graph

The **Dependency Graph** shows how files in a repository depend on each other.

- **Pan & zoom** to explore the map.
- **Click a node** to see its connections; click again to open the file.
- Use the **AI summarize** button to get a written explanation of the module structure.
- The graph highlights **circular or risky dependencies** so you can spot coupling problems.

---

## Intelligence

The **Intelligence** tab is the deepest analysis of a repository:

- **Overview** — general stats and health
- **Folders** — directory structure and what lives where
- **Languages** — language usage breakdown
- **Complexity** — which files are hardest to maintain
- **Import Graph** — dependency relationships
- **Call Graph** — which functions call which
- **Architecture** — component and layer analysis

---

## Semantic Search

The **Semantic Search** tab (also available from the repo workspace **Search** tab) understands meaning, not just keywords:

- **All** — everything
- **Semantic** — meaning-based matches across code
- **Files** — find files by intent
- **Functions** — find functions by behavior
- **Classes** — find classes and types

It uses embeddings (vector search) so you can search *"how does this app authenticate users?"* and get the right code, even if it never mentions "authenticate".

---

## Multi-Agent Tools

The **Multi-Agent** tab orchestrates multiple AI agents to work together on a task. Pick a quick prompt:

- **Code Review** — multiple reviewers analyze the codebase
- **Architecture** — agents map the system structure
- **Security Audit** — dedicated agents hunt for vulnerabilities
- **Generate Tests** — agents write tests across modules
- **Documentation** — agents produce docs collaboratively
- **Explain Code** — agents explain how things work

Results combine each agent's output into a single coordinated report.

---

## Insights

The **Insights** page produces a full report for any repository:

| Tab | Contents |
|---|---|
| **Overview** | Summary and key metrics |
| **Summary** | Executive summary of the codebase |
| **Architecture** | Structure and design analysis |
| **Modules** | Module-level breakdown |
| **Dependencies** | External and internal dependency analysis |
| **Tech Stack** | Languages, frameworks, tools |
| **Timeline** | Development activity over time |
| **Health** | Code quality and maintainability scores |
| **Recommendations** | Concrete suggested improvements |

You can **refresh** the report to regenerate it and **download/export** it to share with your team.

---

## GitHub Integration

Connect your GitHub account to work directly with your GitHub repositories.

### Connect

Go to **GitHub** in the sidebar and click **Connect GitHub**. You can authorize through **OAuth**, or provide a **personal access token** for access to private repositories.

### What you can do

- **View your repositories**, including private ones (with a token)
- **Import** any repo into Repo Verify for analysis
- **Sync** to pull the latest changes
- **Analyze** a repo directly from the list
- **Branches** — browse branches
- **Commits** — view commit history
- **Pull Requests** — view PRs, review them, and **merge** with a merge dialog
- **Issues** — list, create, and manage issues with **labels**
- **Comments** — post and read comments

**Disconnect** your account anytime to revoke access.

---

## Teams & Collaboration

Teams let you and your colleagues share repositories, chat, and run reviews together.

### Creating a Team

1. Go to **Teams** and click **Create Team**.
2. Name your team — you become the **Owner**.
3. Your team gets an **invite code** that others can use to join.

### Joining a Team

- Enter your teammate's **invite code** on the Teams page, or
- Your teammate can invite you directly by **email**.

### Team Roles

| Role | Permissions |
|---|---|
| **Owner** | Full control: settings, delete, all management |
| **Admin** | Manage members, repos, and content |
| **Member** | Work with shared repos and chat |
| **Viewer** | Read-only access |

Change roles, invite, or remove members from the **Members** page.

### Sharing Repositories

On the **Repositories** tab, share any of your repos with the team. Team members can then analyze, review, and chat about them.

### Team Features

| Tab | What it does |
|---|---|
| **Dashboard** | Team overview |
| **Members** | Invite, manage roles, remove members |
| **Repositories** | Share and unshare repos |
| **AI Chat** | Team-wide AI chat |
| **Discussions** | Threaded team conversations |
| **Documentation** | Shared generated docs |
| **Code Reviews** | Team reviews and results |
| **Testing** | Shared test generation |
| **Analytics** | Team-wide metrics |
| **Activity** | What the team has been doing |
| **Notifications** | Team notifications |
| **Settings** | Rename, manage invitations, delete team |

---

## Favorites & History

- **Favorites** — star repositories you work on often. They appear here for one-click access. Your favorites are stored on your device.
- **History** — every action you take is logged here (runs, reviews, chats, edits). Filter by action type, and **clear** the log when you want a fresh start.

---

## Settings

The **Settings** page personalizes your experience:

| Section | Options |
|---|---|
| **Appearance** | **Theme** (light/dark) and **Accent color** (violet, blue, emerald, amber, rose) |
| **AI Model** | Choose your **default model** from 7 providers and models (Gemini 2.5 Flash, Llama 3.3 70B on Groq/OpenRouter, GPT-4.1 Mini, Cerebras, Together, Mistral Large) |
| **Temperature** | Adjust creativity (0–1) with a slider |
| **Retry Strategy** | Fallback order when a provider is unavailable (Gemini → Groq → OpenAI → OpenRouter → Cerebras → Together → Mistral) |
| **Notifications** | Toggle emails for **AI results**, **repo updates**, **weekly digest**, and **security alerts** |
| **Data & Privacy** | **Export all your data** as JSON; **Clear cache** (keeps your theme/accent/sidebar choices); **Delete all data** with confirmation |

Your preferences sync to your account, so they follow you across devices.

---

## Admin Panel

Administrators get a dedicated panel (access from `/admin`). It includes:

- **Users** — search, filter, paginate; **suspend/activate**, **promote/demote** (including admin), **delete**, and **force-logout** sessions
- **Repositories** — manage and delete repos, view statistics
- **AI Services** — monitor AI usage with charts
- **Analytics** — platform-wide charts
- **Security** — active sessions, audit log, blocked items; force logout
- **Activity Logs** — every user action, filterable by type
- **Reports** — generate and download **User**, **Repository**, **AI Usage**, **Security**, and **Activity** reports
- **Notifications** — broadcast **info**, **warning**, and **announcement** notices
- **Code Reviews / Testing / Documentation** — full CRUD + pagination over generated content
- **Search** — index statistics and **rebuild** the search index
- **Backup** — create, download, and delete backups
- **Support** — reply to, update, and remove support messages
- **Settings** — general, appearance, email, AI providers, maintenance, backup
- **Profile** — name, bio, social links
- **Admin Management** — list and suspend other admins

Non-admins are blocked from the admin area.

---

## Key Commands

### Keyboard Shortcuts

| Shortcut | Where | Action |
|---|---|---|
| **Ctrl + K** | Repository workspace | Open the **command palette** |
| **/** | Dependency Graph | Focus the search box |
| **F** | Dependency Graph | Fit / zoom the whole graph to view |
| **Esc** | Various (graphs, chat rename, dialogs) | Close / cancel |
| **Enter** | Chat & search inputs | Send message / run search |
| **Shift + Enter** | Chat inputs | Insert a new line instead of sending |

### Command Palette (Ctrl + K)

Inside a repository workspace, select a file and press **Ctrl + K** to run AI actions instantly:

- **Explain File** — plain-language explanation of the selected file
- **Review File** — code review of the file
- **Suggest Fix** — find and fix bugs in the file
- **Security Scan** — check the file for vulnerabilities
- **Generate Tests** — write tests for the file
- **Generate Commit** — draft a commit message for your changes
- **Generate Pull Request** — draft a PR description
- **Generate Documentation** — document the file

### Multi-Agent Quick Prompts

On the **Multi-Agent** tab, one click launches a coordinated workflow: **Code Review**, **Architecture**, **Security Audit**, **Generate Tests**, **Documentation**, or **Explain Code**.

### AI Chat Categories

- **Understand** — explain concepts and code
- **Analyze** — evaluate design, complexity, and risk

---

## Troubleshooting & FAQ

**I didn't receive the verification email.**
Use the **resend verification** link on the Login page. Check spam. Email is sent from the Repo Verify sender — if your inbox still has nothing, contact support.

**My password reset link expired.**
Reset links are valid for **1 hour**. Request a new one from the **Forgot password** page.

**The AI didn't answer.**
Check your **Settings → AI Model** — a provider may be unavailable. The app automatically falls back through your **retry strategy**. Lower the **temperature** for more deterministic answers.

**My private GitHub repo won't import.**
Connect GitHub with a **personal access token** that has `repo` scope, then import again.

**Where did my generated docs / reviews go?**
Generated content is tied to the repository. Open the repository workspace and use the relevant tab. Admins can also browse content in the admin panel.

**How do I share a repo with my team?**
Open the **Teams** page, choose your team, go to **Repositories**, and share the repo.

**Can I undo a delete?**
No — deleting a repository, conversation, or team is permanent. Use **Settings → Data & Privacy → Export all data** to keep a copy before removing anything.

---

*Need more help? Use the in-app **Support** page or ask in **AI Chat** — it knows how this platform works.*
