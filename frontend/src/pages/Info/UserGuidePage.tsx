import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { useTheme } from "@/context/ThemeContext";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  ChevronDown,
  Rocket,
  UserCircle2,
  Compass,
  LayoutDashboard,
  FolderGit2,
  PanelTop,
  MessageSquareText,
  Search,
  Play,
  ShieldCheck,
  Building2,
  FileText,
  FlaskConical,
  BarChart3,
  Share2,
  Brain,
  Type,
  Sparkles,
  LineChart,
  GitFork,
  Users,
  Star,
  Settings,
  Command,
  HelpCircle,
  Wand2,
  CheckCircle2,
  MousePointerClick,
} from "lucide-react";

interface GuideSection {
  id: string;
  title: string;
  icon: typeof Rocket;
  color: string;
  bgColor: string;
  glow: string;
  heading: string;
  intro: string;
  bullets?: { label: string; detail?: string }[];
  steps?: string[];
  note?: string;
  table?: { headers: string[]; rows: string[][] };
}

const sections: GuideSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    glow: "from-violet-500 to-purple-600",
    heading: "Getting Started",
    intro: "Create your account, verify your email, and you're ready to analyze your first repository.",
    steps: [
      "Open the app and click Register.",
      "Enter your name, email, and password (or sign up with Google / GitHub).",
      "Check your inbox and click the Verify Email link. You must verify your email before you can sign in.",
      "Return to the app and sign in. Enable Remember me to stay signed in for 7 days.",
    ],
    note: "Forgot your password? Use the Forgot password link on the Login page. Reset links are valid for 1 hour. Your session refreshes automatically while you use the app.",
  },
  {
    id: "account-profile",
    title: "Account & Profile",
    icon: UserCircle2,
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-500/10",
    glow: "from-fuchsia-500 to-pink-600",
    heading: "Your Account & Profile",
    intro: "Open your Profile page (avatar menu in the top-right) to manage your personal details.",
    bullets: [
      { label: "Name, email, and bio" },
      { label: "Banner image", detail: "Upload a header image — max 5 MB, JPG/PNG/WebP." },
      { label: "Social links", detail: "LinkedIn, GitHub, and portfolio URLs." },
      { label: "GitHub", detail: "Connect or disconnect your GitHub account." },
      { label: "Change password", detail: "Requires your current password." },
      { label: "Delete account", detail: "Permanently removes your account and data." },
    ],
  },
  {
    id: "navigation",
    title: "Navigating the App",
    icon: Compass,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    glow: "from-cyan-500 to-blue-600",
    heading: "Navigating the App",
    intro: "The sidebar on the left groups everything into sections. The top bar shows your current page, a theme toggle, and your profile menu.",
    table: {
      headers: ["Section", "Pages"],
      rows: [
        ["Main", "Dashboard, Repositories, GitHub, Teams, AI Chat, Search"],
        ["AI Development", "Runs, Insights"],
        ["Analysis", "Documentation, Code Review, Architecture"],
        ["Quality", "Testing, Analytics"],
        ["Personal", "Favorites, History"],
      ],
    },
    note: "Sidebar modes: use the collapse button to switch between expanded, icons-only, and hidden.",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    glow: "from-emerald-500 to-teal-600",
    heading: "Dashboard",
    intro: "Your home screen for jumping into work.",
    bullets: [
      { label: "Overview of your repositories and recent activity" },
      { label: "Quick access to AI Chat, Code Review, Documentation, and Testing" },
      { label: "Add a new repository" },
      { label: "AI Search to ask questions about your codebases" },
    ],
  },
  {
    id: "repositories",
    title: "Repositories",
    icon: FolderGit2,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    glow: "from-violet-500 to-purple-600",
    heading: "Repositories",
    intro: "The Repositories page lists every repository you can work with.",
    steps: [
      "Click Add Repository (the + button).",
      "Paste a valid GitHub repository URL (e.g. https://github.com/octocat/Hello-World).",
      "The repository is cloned and indexed so every AI tool can understand it.",
    ],
    bullets: [
      { label: "Search", detail: "Filter repositories by name as you type." },
      { label: "Sort", detail: "By newest, oldest, name, or number of files." },
      { label: "Open", detail: "Click a repository to open its full workspace." },
      { label: "Delete", detail: "Remove a repository from its workspace." },
    ],
  },
  {
    id: "repository-workspace",
    title: "Repository Workspace",
    icon: PanelTop,
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-500/10",
    glow: "from-fuchsia-500 to-pink-600",
    heading: "The Repository Workspace",
    intro: "A full IDE-style workspace with a file explorer and a content panel. Everything for that repo lives in the tabs.",
    table: {
      headers: ["Tab", "What it does"],
      rows: [
        ["Overview", "High-level summary of the repository"],
        ["Files", "Browse and read every file"],
        ["AI Chat", "Chat about this specific repository"],
        ["Review", "AI code review for the repo or specific files"],
        ["Architecture", "How files are organized into layers and components"],
        ["Documentation", "Generate docs for files, scopes, or the whole repo"],
        ["Dependency Graph", "Interactive map of import relationships"],
        ["Intelligence", "Deep analysis: folders, languages, complexity, call graphs"],
        ["Doc Generator", "Create README, API docs, function docs, or architecture docs"],
        ["Search", "Semantic search across this repo's code"],
        ["Multi-Agent", "Coordinated multi-agent workflows"],
        ["Settings", "Repository settings and delete"],
      ],
    },
    note: "Select a file and use the AI actions in the toolbar to Explain, Review, Fix, or Test that file. Ctrl + K opens the command palette.",
  },
  {
    id: "ai-chat",
    title: "AI Chat",
    icon: MessageSquareText,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    glow: "from-violet-500 to-purple-600",
    heading: "AI Chat",
    intro: "Your assistant for anything code-related. Choose a repository for full codebase context, pick a prompt category, and ask away.",
    bullets: [
      { label: "Prompt categories", detail: "Understand — explain how things work. Analyze — dig into design, complexity, and risk." },
      { label: "Streaming answers", detail: "Responses stream live with markdown and code blocks." },
      { label: "Conversations", detail: "Rename, delete, and export as PDF or Word." },
      { label: "Generate tests", detail: "Create test files for code the AI produces, right from the chat." },
    ],
  },
  {
    id: "search",
    title: "Search",
    icon: Search,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    glow: "from-cyan-500 to-blue-600",
    heading: "Search",
    intro: "Natural-language search across all your repositories.",
    bullets: [
      { label: "Ask in plain English", detail: "e.g. \"Where is the login handler?\"" },
      { label: "Result tabs", detail: "All, Files, Functions, and Repositories." },
      { label: "AI-ranked", detail: "The most relevant code appears first. Press Enter to search." },
    ],
  },
  {
    id: "runs",
    title: "Runs & Pipeline",
    icon: Play,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    glow: "from-emerald-500 to-teal-600",
    heading: "Runs & the Analysis Pipeline",
    intro: "Run the analysis pipeline against any repository URL. The run page auto-refreshes every 2 seconds so you can watch progress live.",
    steps: [
      "Go to Runs → New Run.",
      "Enter a repository URL and optional branch.",
      "Submit — the pipeline processes the repo through four stages:",
    ],
    table: {
      headers: ["Stage", "Purpose"],
      rows: [
        ["1. Debugging", "Find and explain bugs"],
        ["2. Codegen", "Generate improvements and fixes"],
        ["3. Security", "Detect vulnerabilities and security issues"],
        ["4. Performance", "Identify performance bottlenecks"],
      ],
    },
    note: "Statuses: queued, running, done — or failed / rejected / blocked if something went wrong.",
  },
  {
    id: "code-review",
    title: "Code Review",
    icon: ShieldCheck,
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-500/10",
    glow: "from-fuchsia-500 to-pink-600",
    heading: "Code Review",
    intro: "AI reviews that check correctness, security, readability, and best practices.",
    bullets: [
      { label: "Scope", detail: "Review an entire repository or a specific file." },
      { label: "Findings", detail: "Explanations and suggested fixes for every issue." },
      { label: "History", detail: "Your review history is kept for revisiting past reviews." },
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    icon: Building2,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    glow: "from-violet-500 to-purple-600",
    heading: "Architecture",
    intro: "See the high-level structure of your code.",
    bullets: [
      { label: "Layer categorization", detail: "Files grouped into layers (UI, API, services, data, etc.)." },
      { label: "Architecture tree", detail: "Visual breakdown of components and their relationships." },
      { label: "Per-file analysis", detail: "Run AI architecture analysis on individual files from the workspace." },
    ],
  },
  {
    id: "documentation",
    title: "Documentation",
    icon: FileText,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    glow: "from-cyan-500 to-blue-600",
    heading: "Documentation",
    intro: "Generate documentation automatically.",
    bullets: [
      { label: "Dashboard docs", detail: "Six categories: Auto, README, API, Architecture, Database, Routes." },
      { label: "Workspace scopes", detail: "Single file, multiple files, or the entire repository." },
      { label: "Doc Generator", detail: "README, API Docs, Functions & Classes, and Architecture documents." },
    ],
  },
  {
    id: "testing",
    title: "Testing",
    icon: FlaskConical,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    glow: "from-emerald-500 to-teal-600",
    heading: "Testing",
    intro: "Generate AI-written unit and integration tests.",
    bullets: [
      { label: "Unit tests", detail: "For functions and logic." },
      { label: "Integration tests", detail: "For end-to-end flows." },
      { label: "From chat", detail: "Generate test files directly in AI Chat too." },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: BarChart3,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    glow: "from-amber-500 to-orange-600",
    heading: "Analytics",
    intro: "Charts about your code.",
    bullets: [
      { label: "File extension breakdown", detail: "What kinds of files make up your repos." },
      { label: "Language distribution", detail: "Which languages you use and how much." },
      { label: "Per-repository metrics", detail: "Detailed metrics inside the workspace." },
    ],
  },
  {
    id: "dependency-graph",
    title: "Dependency Graph",
    icon: Share2,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    glow: "from-violet-500 to-purple-600",
    heading: "Dependency Graph",
    intro: "See how files depend on each other.",
    bullets: [
      { label: "Explore", detail: "Pan and zoom the map, click nodes to see connections." },
      { label: "AI summarize", detail: "Get a written explanation of the module structure." },
      { label: "Risk spotting", detail: "Highlights circular or risky dependencies." },
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence",
    icon: Brain,
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-500/10",
    glow: "from-fuchsia-500 to-pink-600",
    heading: "Intelligence",
    intro: "The deepest analysis of a repository.",
    bullets: [
      { label: "Overview", detail: "General stats and health." },
      { label: "Folders", detail: "Directory structure." },
      { label: "Languages", detail: "Language usage breakdown." },
      { label: "Complexity", detail: "Which files are hardest to maintain." },
      { label: "Import Graph", detail: "Dependency relationships." },
      { label: "Call Graph", detail: "Which functions call which." },
      { label: "Architecture", detail: "Component and layer analysis." },
    ],
  },
  {
    id: "semantic-search",
    title: "Semantic Search",
    icon: Type,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    glow: "from-cyan-500 to-blue-600",
    heading: "Semantic Search",
    intro: "Search that understands meaning, not just keywords — powered by vector embeddings.",
    bullets: [
      { label: "All", detail: "Everything." },
      { label: "Semantic", detail: "Meaning-based matches across code." },
      { label: "Files / Functions / Classes", detail: "Find things by intent or behavior." },
    ],
  },
  {
    id: "multi-agent",
    title: "Multi-Agent Tools",
    icon: Sparkles,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    glow: "from-emerald-500 to-teal-600",
    heading: "Multi-Agent Tools",
    intro: "Orchestrates multiple AI agents that work together on a task and combine into one coordinated report.",
    bullets: [
      { label: "Code Review" },
      { label: "Architecture" },
      { label: "Security Audit" },
      { label: "Generate Tests" },
      { label: "Documentation" },
      { label: "Explain Code" },
    ],
  },
  {
    id: "insights",
    title: "Insights",
    icon: LineChart,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    glow: "from-violet-500 to-purple-600",
    heading: "Insights",
    intro: "A full report for any repository. Refresh to regenerate, and download or export to share.",
    table: {
      headers: ["Tab", "Contents"],
      rows: [
        ["Overview", "Summary and key metrics"],
        ["Summary", "Executive summary of the codebase"],
        ["Architecture", "Structure and design analysis"],
        ["Modules", "Module-level breakdown"],
        ["Dependencies", "External and internal dependency analysis"],
        ["Tech Stack", "Languages, frameworks, tools"],
        ["Timeline", "Development activity over time"],
        ["Health", "Code quality and maintainability scores"],
        ["Recommendations", "Concrete suggested improvements"],
      ],
    },
  },
  {
    id: "github",
    title: "GitHub Integration",
    icon: GitFork,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    glow: "from-amber-500 to-orange-600",
    heading: "GitHub Integration",
    intro: "Connect your GitHub account to work directly with your repositories. Authorize via OAuth, or provide a personal access token for private repos.",
    bullets: [
      { label: "Repositories", detail: "View, import, sync, and analyze your repos." },
      { label: "Branches & Commits", detail: "Browse branches and commit history." },
      { label: "Pull Requests", detail: "View, review, and merge with the merge dialog." },
      { label: "Issues", detail: "List, create, and manage issues with labels." },
      { label: "Comments", detail: "Post and read comments." },
    ],
    note: "Disconnect your account anytime to revoke access.",
  },
  {
    id: "teams",
    title: "Teams",
    icon: Users,
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-500/10",
    glow: "from-fuchsia-500 to-pink-600",
    heading: "Teams & Collaboration",
    intro: "Teams let you share repositories, chat, and run reviews together.",
    steps: [
      "Go to Teams and click Create Team.",
      "Name your team — you become the Owner.",
      "Share the invite code, or invite teammates directly by email.",
    ],
    table: {
      headers: ["Role", "Permissions"],
      rows: [
        ["Owner", "Full control: settings, delete, all management"],
        ["Admin", "Manage members, repos, and content"],
        ["Member", "Work with shared repos and chat"],
        ["Viewer", "Read-only access"],
      ],
    },
    bullets: [
      { label: "Team features", detail: "Dashboard, Members, Repositories, AI Chat, Discussions, Documentation, Code Reviews, Testing, Analytics, Activity, Notifications, Settings." },
    ],
  },
  {
    id: "favorites-history",
    title: "Favorites & History",
    icon: Star,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    glow: "from-amber-500 to-orange-600",
    heading: "Favorites & History",
    intro: "Star the repositories you work on often, and keep track of everything you do.",
    bullets: [
      { label: "Favorites", detail: "One-click access to starred repositories (stored on your device)." },
      { label: "History", detail: "Every action is logged — runs, reviews, chats, edits. Filter by type and clear the log." },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    glow: "from-cyan-500 to-blue-600",
    heading: "Settings",
    intro: "Personalize your experience. Preferences sync to your account across devices.",
    table: {
      headers: ["Section", "Options"],
      rows: [
        ["Appearance", "Theme (light/dark) and accent color (violet, blue, emerald, amber, rose)"],
        ["AI Model", "Default model from 7 providers and models (Gemini 2.5 Flash, Llama 3.3 70B, GPT-4.1 Mini, and more)"],
        ["Temperature", "Creativity control from 0 to 1"],
        ["Retry Strategy", "Fallback order when a provider is unavailable"],
        ["Notifications", "Emails for AI results, repo updates, weekly digest, security alerts"],
        ["Data & Privacy", "Export all data as JSON; clear cache; delete all data with confirmation"],
      ],
    },
  },
  {
    id: "admin",
    title: "Admin Panel",
    icon: ShieldCheck,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    glow: "from-red-500 to-rose-600",
    heading: "Admin Panel",
    intro: "Administrators get a dedicated panel for managing the platform.",
    bullets: [
      { label: "Users", detail: "Search, suspend, promote/demote, delete, force-logout sessions." },
      { label: "Repositories & AI", detail: "Manage repos, monitor AI usage." },
      { label: "Security & Logs", detail: "Sessions, audit log, activity logs." },
      { label: "Reports & Backup", detail: "Generate reports and manage backups." },
      { label: "Notifications & Support", detail: "Broadcast notices and manage support messages." },
      { label: "Content", detail: "Full CRUD over code reviews, testing, and documentation." },
    ],
  },
];

const shortcuts = [
  { key: "Ctrl + K", where: "Repository workspace", action: "Open the command palette" },
  { key: "/", where: "Dependency Graph", action: "Focus the search box" },
  { key: "F", where: "Dependency Graph", action: "Fit the whole graph to view" },
  { key: "Esc", where: "Graphs, chat rename, dialogs", action: "Close / cancel" },
  { key: "Enter", where: "Chat & search inputs", action: "Send message / run search" },
  { key: "Shift + Enter", where: "Chat inputs", action: "Insert a new line instead of sending" },
];

const paletteCommands = [
  { command: "Explain File", detail: "Plain-language explanation of the selected file" },
  { command: "Review File", detail: "Code review of the file" },
  { command: "Suggest Fix", detail: "Find and fix bugs in the file" },
  { command: "Security Scan", detail: "Check the file for vulnerabilities" },
  { command: "Generate Tests", detail: "Write tests for the file" },
  { command: "Generate Commit", detail: "Draft a commit message for your changes" },
  { command: "Generate Pull Request", detail: "Draft a PR description" },
  { command: "Generate Documentation", detail: "Document the file" },
];

const faqItems = [
  {
    q: "I didn't receive the verification email.",
    a: "Use the resend verification link on the Login page and check your spam folder.",
  },
  {
    q: "My password reset link expired.",
    a: "Reset links are valid for 1 hour. Request a new one from the Forgot password page.",
  },
  {
    q: "The AI didn't answer.",
    a: "Check Settings → AI Model — a provider may be unavailable. The app falls back through your retry strategy automatically.",
  },
  {
    q: "My private GitHub repo won't import.",
    a: "Connect GitHub with a personal access token that has the repo scope, then import again.",
  },
  {
    q: "How do I share a repo with my team?",
    a: "Open Teams, choose your team, go to Repositories, and share the repo.",
  },
  {
    q: "Can I undo a delete?",
    a: "No — deleting a repository, conversation, or team is permanent. Use Settings → Data & Privacy → Export all data to keep a copy first.",
  },
];

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const floatingIcons = [
  { icon: Sparkles, x: "4%", y: "14%", delay: 0, color: "text-violet-400" },
  { icon: Command, x: "93%", y: "18%", delay: 1.2, color: "text-fuchsia-400" },
  { icon: BookOpen, x: "5%", y: "52%", delay: 2, color: "text-cyan-400" },
  { icon: Users, x: "93%", y: "48%", delay: 0.6, color: "text-emerald-400" },
  { icon: Wand2, x: "6%", y: "80%", delay: 1.6, color: "text-amber-400" },
];

function AnimatedCounter({ end, suffix, label, gradient, isDark, index, href }: {
  end: number;
  suffix: string;
  label: string;
  gradient: string;
  isDark: boolean;
  index: number;
  href: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLAnchorElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const duration = 1.8;
          const step = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <motion.a
      ref={ref}
      href={href}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.06 }}
      className="group relative cursor-pointer text-center"
    >
      <div className={`absolute -inset-3 bg-gradient-to-b ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-500`} />
      <div className="relative">
        <div className={`bg-gradient-to-b ${gradient} bg-clip-text font-[Outfit] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-transparent`}>
          {count}{suffix}
        </div>
        <div className={`mt-2 inline-flex items-center gap-1 text-xs sm:text-sm font-[Inter] transition-colors ${isDark ? "text-slate-400 group-hover:text-white" : "text-slate-500 group-hover:text-slate-900"}`}>
          {label}
          <motion.span
            animate={{ x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <ArrowRight size={12} />
          </motion.span>
        </div>
      </div>
    </motion.a>
  );
}

function SectionCard({ section, index }: { section: GuideSection; index: number }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const Icon = section.icon;

  return (
    <motion.section
      id={section.id}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative scroll-mt-24 overflow-hidden rounded-2xl border"
    >
      {/* Animated top accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 + index * 0.02, duration: 0.8, ease: "easeOut" }}
        className={`absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r ${section.glow}`}
      />

      {/* Hover glow wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${section.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]`} />

      <div className={`relative p-6 sm:p-8 ${isDark ? "border-white/[0.08] bg-[var(--card-bg)]" : "border-slate-200/70 bg-white/60 backdrop-blur-xl"}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 6, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 260, damping: 15 }}
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${section.bgColor}`}
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${section.glow} opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-40`} />
              <Icon size={20} className={`relative ${section.color}`} />
            </motion.div>
            <h2 className={`font-[Outfit] text-lg font-bold sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
              {section.heading}
            </h2>
          </div>
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + index * 0.02, type: "spring", stiffness: 260, damping: 14 }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-[Outfit] text-xs font-bold transition-colors duration-300 ${
              isDark ? "bg-white/5 text-slate-400 group-hover:bg-violet-500/20 group-hover:text-violet-300" : "bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-700"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </motion.span>
        </div>

        <p className={`mb-5 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{section.intro}</p>

        {section.steps && (
          <ol className="mb-5 space-y-2.5">
            {section.steps.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-3 text-sm"
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-300 ${
                  isDark ? "bg-violet-500/20 text-violet-300 group-hover:bg-violet-500/40" : "bg-violet-100 text-violet-700 group-hover:bg-violet-200"
                }`}>
                  {i + 1}
                </span>
                <span className={isDark ? "text-slate-300" : "text-slate-600"}>{step}</span>
              </motion.li>
            ))}
          </ol>
        )}

        {section.bullets && (
          <ul className="mb-5 space-y-2.5">
            {section.bullets.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-start gap-3 text-sm"
              >
                <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-125`}>
                  <CheckCircle2 size={15} className={section.color} />
                </span>
                <span className={isDark ? "text-slate-300" : "text-slate-600"}>
                  <span className="font-medium">{b.label}</span>
                  {b.detail && <span className={isDark ? "text-slate-400" : "text-slate-500"}> — {b.detail}</span>}
                </span>
              </motion.li>
            ))}
          </ul>
        )}

        {section.table && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-5 overflow-hidden rounded-xl border"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className={isDark ? "bg-white/[0.04]" : "bg-slate-50"}>
                  <tr>
                    {section.table.headers.map((h) => (
                      <th key={h} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {section.table.rows.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                      whileHover={{ backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(124,58,237,0.04)" }}
                      className="transition-colors"
                    >
                      {row.map((cell, j) => (
                        <td key={j} className={`px-4 py-2.5 ${isDark ? "text-slate-300" : "text-slate-600"} ${j === 0 ? "font-medium" : ""}`}>
                          {cell}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {section.note && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className={`rounded-xl border px-4 py-3 text-sm ${isDark ? "border-violet-500/20 bg-violet-500/5 text-violet-200" : "border-violet-200 bg-violet-50 text-violet-800"}`}
          >
            <span className="mr-1.5 inline-block animate-pulse">💡</span>
            {section.note}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

export default function UserGuidePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 0.6], [1, 0.96]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const faqQuery = faqSearch.trim().toLowerCase();
  const filteredFaq = faqItems.filter(
    (item) => item.q.toLowerCase().includes(faqQuery) || item.a.toLowerCase().includes(faqQuery)
  );

const guideStats = [
  { end: sections.length, suffix: "", label: "Sections", gradient: "from-violet-500 to-purple-600", href: "#table-of-contents" },
  { end: shortcuts.length, suffix: "", label: "Shortcuts", gradient: "from-fuchsia-500 to-pink-600", href: "#shortcuts" },
  { end: paletteCommands.length, suffix: "", label: "Commands", gradient: "from-cyan-500 to-blue-600", href: "#command-palette" },
  { end: faqItems.length, suffix: "", label: "FAQ Items", gradient: "from-emerald-500 to-teal-600", href: "#faq" },
];

  return (
    <main className={`min-h-screen font-[Inter] transition-colors duration-300 ${isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900"}`}>
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
      />

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-colors ${
              isDark ? "bg-violet-600 text-white hover:bg-violet-500" : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <div ref={heroRef} className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <Link to="/" className={`group inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative mb-14 text-center">
          {/* Floating decorative icons */}
          {floatingIcons.map(({ icon: FIcon, x, y, delay, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + delay, type: "spring", stiffness: 200, damping: 12 }}
              className={`pointer-events-none absolute hidden lg:block ${color}`}
              style={{ left: x, top: y }}
            >
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4 + i, ease: "easeInOut", delay }}
              >
                <FIcon size={26} className="opacity-60" />
              </motion.div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
            className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm ${isDark ? "border-violet-500/20 bg-violet-500/10 text-violet-300" : "border-violet-200 bg-violet-100 text-violet-700"}`}
          >
            <motion.div
              animate={{ rotate: [0, 15, 0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <BookOpen size={14} className="text-violet-400" />
            </motion.div>
            User Guide
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`}
            />
          </motion.div>

          {/* Staggered headline */}
          <div className="mx-auto max-w-3xl font-[Outfit] text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            {["Your Complete", "Repo Verify", "User Guide"].map((word, i) => (
              <div key={word} className="overflow-hidden">
                <motion.span
                  custom={i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  className={`block ${
                    i === 1
                      ? `${isDark ? "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400" : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"} bg-clip-text text-transparent`
                      : isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {word}
                </motion.span>
              </div>
            ))}
          </div>

          {/* Typing animation */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className={`mx-auto mt-5 h-8 text-base font-[Outfit] font-semibold sm:text-lg md:text-xl ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            <TypeAnimation
              sequence={[
                "Explore every feature", 1600,
                "Review code with AI", 1600,
                "Generate docs & tests", 1600,
                "Collaborate with your team", 1600,
                "Ship faster", 1600,
              ]}
              repeat={Infinity}
              wrapper="span"
              cursor={true}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className={`mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            A complete walkthrough of every feature — from your first repository to team collaboration and admin tools.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <a
                href="#table-of-contents"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
              >
                Start Exploring
                <motion.span animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
                  <ChevronDown size={16} />
                </motion.span>
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition-colors ${
                  isDark ? "border-white/15 text-white hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Open Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Guide stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-16 overflow-hidden rounded-3xl border px-6 py-8 backdrop-blur-xl sm:px-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-fuchsia-600/5 pointer-events-none" />
          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {guideStats.map((stat, i) => (
              <AnimatedCounter key={stat.label} {...stat} isDark={isDark} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Table of contents */}
        <motion.div
          id="table-of-contents"
          className="scroll-mt-24 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`mb-6 flex items-center gap-2 font-[Outfit] text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            <motion.span animate={{ rotate: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
              <MousePointerClick size={15} />
            </motion.span>
            Jump to a Section
          </motion.h2>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.a
                  key={s.id}
                  variants={cardVariants}
                  href={`#${s.id}`}
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group relative overflow-hidden rounded-xl border px-4 py-3 transition-colors duration-300 ${
                    activeId === s.id
                      ? isDark
                        ? "border-violet-500/40 bg-violet-500/10 text-violet-200 shadow-lg shadow-violet-500/10"
                        : "border-violet-300 bg-violet-100 text-violet-800 shadow-md"
                      : isDark
                        ? "border-white/[0.08] bg-[var(--card-bg)] hover:border-violet-500/40 hover:bg-violet-500/5"
                        : "border-slate-200/70 bg-white/60 backdrop-blur-xl hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.06]`} />
                  <div className="relative flex items-center gap-3">
                    <motion.span whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: "spring", stiffness: 300, damping: 12 }}>
                      <Icon size={16} className={s.color} />
                    </motion.span>
                    <span className="text-xs font-medium sm:text-sm">
                      <span className={`mr-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{i + 1}.</span>
                      <span className={isDark ? "text-slate-200" : "text-slate-700"}>{s.title}</span>
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <SectionCard key={section.id} section={section} index={i} />
          ))}
        </div>

        {/* Key Commands */}
        <motion.section
          id="key-commands"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="group relative mt-10 scroll-mt-24 overflow-hidden rounded-2xl border"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
          />
          <div className={`relative p-6 sm:p-8 ${isDark ? "border-white/[0.08] bg-[var(--card-bg)]" : "border-slate-200/70 bg-white/60 backdrop-blur-xl"}`}>
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 260, damping: 15 }}
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${isDark ? "bg-violet-500/10" : "bg-violet-100"}`}
              >
                <Command size={20} className="text-violet-400" />
              </motion.div>
              <h2 className={`font-[Outfit] text-lg font-bold sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>Key Commands</h2>
            </div>

            <h3 id="shortcuts" className={`mb-3 mt-6 scroll-mt-28 text-sm font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Keyboard Shortcuts</h3>
            <div className="overflow-hidden rounded-xl border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className={isDark ? "bg-white/[0.04]" : "bg-slate-50"}>
                    <tr>
                      <th className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Shortcut</th>
                      <th className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Where</th>
                      <th className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {shortcuts.map((s, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 + i * 0.06 }}
                        whileHover={{ backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(124,58,237,0.04)" }}
                        className="transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1">
                            {s.key.split("+").map((part, j) => (
                              <motion.kbd
                                key={j}
                                whileHover={{ y: -2, scale: 1.08 }}
                                className={`rounded-md border border-b-2 px-2 py-1 text-xs font-semibold shadow-sm transition-colors ${
                                  isDark ? "border-white/10 bg-violet-500/10 text-violet-300" : "border-slate-200 bg-violet-100 text-violet-700"
                                }`}
                              >
                                {part.trim()}
                              </motion.kbd>
                            ))}
                          </span>
                        </td>
                        <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{s.where}</td>
                        <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{s.action}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h3 id="command-palette" className={`mb-3 mt-8 scroll-mt-28 text-sm font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Command Palette (Ctrl + K)</h3>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Inside a repository workspace, select a file and press{" "}
              <motion.span
                whileHover={{ scale: 1.08 }}
                className={`inline-block rounded-md border border-b-2 px-2 py-0.5 text-xs font-semibold ${isDark ? "border-white/10 bg-violet-500/10 text-violet-300" : "border-slate-200 bg-violet-100 text-violet-700"}`}
              >
                Ctrl + K
              </motion.span>{" "}
              to run instant AI actions:
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {paletteCommands.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-300 ${
                    isDark ? "border-white/[0.08] bg-[var(--card-bg)] hover:border-violet-500/30 hover:bg-violet-500/5" : "border-slate-200/70 bg-white/60 backdrop-blur-xl hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  <motion.span
                    whileHover={{ rotate: 6, scale: 1.15 }}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isDark ? "bg-violet-500/10" : "bg-violet-100"}`}
                  >
                    <Sparkles size={13} className="text-violet-400" />
                  </motion.span>
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{c.command}</p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{c.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          id="faq"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="group relative mt-10 scroll-mt-24 overflow-hidden rounded-2xl border"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
          />
          <div className={`relative p-6 sm:p-8 ${isDark ? "border-white/[0.08] bg-[var(--card-bg)]" : "border-slate-200/70 bg-white/60 backdrop-blur-xl"}`}>
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 260, damping: 15 }}
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${isDark ? "bg-emerald-500/10" : "bg-emerald-100"}`}
              >
                <HelpCircle size={20} className="text-emerald-400" />
              </motion.div>
              <h2 className={`font-[Outfit] text-lg font-bold sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>Troubleshooting & FAQ</h2>
            </div>

            <div className={`mb-5 flex items-center rounded-xl border px-4 py-2.5 transition-colors ${isDark ? "border-white/10 bg-white/[0.03] focus-within:border-emerald-500/40" : "border-slate-200/70 bg-white/60 backdrop-blur-xl focus-within:border-emerald-300"}`}>
              <Search size={16} className={isDark ? "shrink-0 text-slate-500" : "shrink-0 text-slate-400"} />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => { setFaqSearch(e.target.value); setOpenFaq(null); }}
                placeholder="Search the FAQ…"
                className={`ml-3 w-full bg-transparent text-sm outline-none ${isDark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"}`}
              />
              {faqSearch && (
                <button type="button" onClick={() => setFaqSearch("")} className={`ml-2 shrink-0 text-xs font-medium ${isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}>
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-3">
              {filteredFaq.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className={`w-full rounded-xl border px-5 py-4 text-left transition-all duration-300 ${
                        isOpen
                          ? isDark ? "border-emerald-500/20 bg-emerald-500/5 shadow-lg shadow-emerald-500/5" : "border-emerald-300 bg-emerald-50 shadow-md"
                          : isDark ? "border-white/[0.08] bg-[var(--card-bg)] hover:border-white/10 hover:bg-white/[0.04]" : "border-slate-200/70 bg-white/60 backdrop-blur-xl hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className={`text-sm font-semibold sm:text-base ${isDark ? "text-white" : "text-slate-900"}`}>{item.q}</h3>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isOpen ? "bg-emerald-500/20 text-emerald-400" : isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <ChevronDown size={14} />
                        </motion.span>
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className={`mt-3 text-sm leading-relaxed border-t pt-3 ${isDark ? "text-slate-400 border-white/[0.06]" : "text-slate-500 border-slate-100"}`}>{item.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                );
              })}
              {filteredFaq.length === 0 && (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <HelpCircle size={20} className={`mx-auto mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    No results found for "{faqSearch}". Try a different search term.
                  </p>
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
              className={`mt-8 overflow-hidden rounded-xl border p-6 text-center sm:p-8 ${isDark ? "border-white/[0.08] bg-[var(--card-bg)] shadow-lg shadow-black/20" : "border-slate-200/70 bg-white/60 backdrop-blur-xl"}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-fuchsia-600/5`} />
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                >
                  <Wand2 size={22} />
                </motion.div>
                <h3 className="font-[Outfit] text-lg font-bold sm:text-xl mb-1">Need more help?</h3>
                <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Use the in-app Support page, or ask in AI Chat — it knows how this platform works.
                </p>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
                  >
                    Get Started Free
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
                      <ArrowLeft size={15} className="rotate-180" />
                    </motion.span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 flex flex-col items-center justify-center gap-2 text-center"
        >
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Still stuck?{" "}
            <Link to="/support" className="font-medium text-violet-500 transition-colors hover:text-violet-400">Visit Support</Link>
            {" · "}
            <Link to="/faq" className="font-medium text-violet-500 transition-colors hover:text-violet-400">FAQ</Link>
            {" · "}
            <Link to="/changelog" className="font-medium text-violet-500 transition-colors hover:text-violet-400">Changelog</Link>
          </p>
          <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>Last updated: June 2026</p>
        </motion.div>
      </div>
    </main>
  );
}
