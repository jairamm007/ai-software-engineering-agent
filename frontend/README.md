# 🎨 Repo Verify Frontend — AI Software Engineering Agent

💡 A modern, AI-powered frontend application that lets developers import GitHub repositories, chat with their codebase, review code, generate documentation, analyze architecture, run automated pipelines, and collaborate with teams through an intuitive user interface.

## 📖 Overview

The Repo Verify Frontend is a responsive web application built with modern web technologies. It provides developers with an interactive workspace to import repositories, view AI-powered analysis and recommendations, inspect architecture and dependency graphs, run debug/codegen/security/performance pipelines, explore repository insights, manage teams, and administer the platform.

## ✨ Features

- 🔐 Secure User Authentication (email/password + Google/GitHub OAuth)
- 🏠 Interactive Dashboard
- 📂 Repository Management & Import
- 🤖 AI-Powered Code Chat (RAG context)
- 🧠 Multi-Agent AI Workspace
- 🛠️ Automated Debug / Codegen / Security / Performance Runs
- 📊 Skill & Health Score Visualization (Recharts)
- 🕸️ Architecture, Dependency & Call Graphs (ReactFlow)
- 📄 Repository Intelligence & Insights
- 🛣️ Documentation & Test Generation
- 💼 GitHub Integration (PRs, Issues, CI/CD, Webhooks)
- 👥 Team Collaboration (members, chat, docs, reviews, analytics)
- 👤 User Profile Management
- 🛡️ Admin Panel (20+ pages)
- 📱 Responsive Design
- ⚡ Fast & Modern User Experience (lazy-loaded routes)

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| ⚛️ React | Frontend Library |
| 📘 TypeScript | Programming Language |
| ⚡ Vite | Build Tool |
| 🎨 Tailwind CSS | Styling |
| 🔄 React Router | Routing (lazy-loaded, protected/guest/admin guards) |
| 📡 Axios | API Communication |
| 🔍 TanStack Query | Data Fetching & Caching |
| 📊 Recharts | Charts & Analytics |
| 🕸️ ReactFlow + dagre | Graph Visualization |
| 🎞️ framer-motion | Animations |
| 📝 react-markdown | Markdown Rendering |
| 🔤 react-syntax-highlighter | Code Syntax Highlighting |
| 🧾 react-hook-form + zod | Forms & Validation |
| 🔔 sonner | Notifications & Toasts |
| 📦 npm | Package Manager |

## 📂 Project Structure

```
frontend/
│
├── 📁 public/
├── 📁 src/
│   ├── 📁 components/        # Reusable UI, auth, chat, github, insights, pipeline components
│   ├── 📁 constants/         # App constants
│   ├── 📁 context/           # Auth, App, Sidebar, Theme contexts
│   ├── 📁 hooks/             # Custom hooks
│   ├── 📁 layouts/           # Public, Dashboard, Repository, Team, Admin, IDE layouts
│   ├── 📁 lib/               # Auth client, axios, utilities
│   ├── 📁 pages/             # Page components (Admin, Auth, Chat, Dashboard, GitHub, Info, Insights, Profile, Repository, Runs, Settings, Teams, ...)
│   ├── 📁 routes/            # Route table
│   ├── 📁 services/          # Typed API service layer
│   ├── 📁 store/             # State store
│   ├── 📁 types/             # TypeScript types
│   ├── 📁 utils/             # Helpers, file tree builder, file icons
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx            # createBrowserRouter with lazy pages
├── 📦 package.json
├── ⚙️ vite.config.ts
├── 🎨 tailwind.config.js (via @tailwindcss/vite)
├── 📘 tsconfig.json
└── 📖 README.md
```

## ⚙️ Prerequisites

Before running the project, install:

- ✅ Git
- ✅ Node.js (LTS)
- ✅ npm
- ✅ Visual Studio Code (Recommended)
- ✅ Backend running on `http://localhost:3000`

## 📥 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-org>/ai-software-engineering-agent.git
```

### 2️⃣ Navigate to the Frontend

```bash
cd ai-software-engineering-agent/frontend
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root and add the required environment variables.

Example:

```env
VITE_API_URL=http://localhost:3000
```

> In development, you can leave `VITE_API_URL` empty — the Vite dev server proxies `/api` requests to `http://localhost:3000`.

### 5️⃣ Start the Development Server

```bash
npm run dev
```

### 6️⃣ Open the Application

Open your browser and visit:

```
http://localhost:5173
```

## 🌟 Application Modules

- 🎯 **Landing / Public** — marketing pages, FAQ, docs, blog, changelog, support, about, careers, privacy, terms
- 🔐 **Authentication** — login, register, email verification, forgot/reset password
- 🏠 **Dashboard** — overview, search, code review, runs, architecture, documentation, testing, analytics, favorites, history
- 📂 **Repositories** — list, details, overview, files, chat, review, architecture, documentation, dependency graph, intelligence, doc generator, semantic search, multi-agent, settings
- 💬 **AI Chat** — conversation with repository context
- 🛠️ **Runs (Pipeline)** — list, create, run detail with stage statuses
- 📊 **Insights** — repository insights & health reports
- 🐙 **GitHub Integration** — connect, repos, branches, commits, PRs, issues, CI/CD, branch protection, webhooks
- 👥 **Teams** — dashboard, members, repositories, chat, discussions, documentation, code reviews, testing, analytics, activity, notifications, settings
- 👤 **Profile & Settings** — profile, user preferences, theme/accent
- 🛡️ **Admin** — dashboard, users, repositories, AI services, analytics, security, notifications, reports, settings, admins, documentation, code reviews, testing, search, activity logs, backup, support, profile

## 🌍 Environment Variables

Create a `.env` file with the required values:

```env
VITE_API_URL=http://localhost:3000
```

## 🔨 Production Build

```bash
npm run build
npm run preview
```

The production bundle is emitted to `dist/` (Vercel-ready via `vercel.json`).

## 📸 Screenshots

📷 Add screenshots or GIFs of the application interface here to showcase the user experience.

## 🤝 Contributors

- 👨‍💻 Jai Ram M

## 📜 License

This project is developed for academic and educational purposes.

## ⭐ Support

If you find this project helpful, consider giving it a ⭐ Star on GitHub.

🚀 Built with passion by the Repo Verify team.
