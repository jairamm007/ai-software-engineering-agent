import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, BookOpen, Terminal, Code2, Settings, Zap, ExternalLink } from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 18 } },
};

const sections = [
  {
    icon: Zap,
    title: "Quick Start",
    content: `Get up and running in under 2 minutes. No installation required — Repo Verify runs entirely in your browser.`,
    steps: [
      { label: "Sign Up", desc: "Create a free account at repo-verify.dev or sign in with GitHub/Google." },
      { label: "Connect a Repository", desc: "Paste any public or private GitHub repository URL into the dashboard." },
      { label: "Wait for Indexing", desc: "Our AI agent clones, parses, and indexes your entire codebase (2–5 min)." },
      { label: "Explore", desc: "Use the AI Chat, Code Review, Architecture Map, and Documentation tabs." },
    ],
  },
  {
    icon: Terminal,
    title: "Configuration",
    content: `Repo Verify works out of the box with zero configuration. For advanced use cases, customize via the Settings panel.`,
    code: `// repo-verify.config.ts (optional)
export default {
  ai: {
    model: "gpt-4o",        // or "claude-3.5-sonnet"
    temperature: 0.3,
    maxTokens: 4096,
  },
  analysis: {
    depth: "deep",           // "quick" | "deep"
    languages: ["typescript", "python"],
    includeTests: false,
  },
  documentation: {
    format: "markdown",      // "markdown" | "html"
    sections: ["overview", "api", "architecture"],
  },
};`,
  },
  {
    icon: Code2,
    title: "API Reference",
    content: `Use the REST API to integrate Repo Verify into your CI/CD pipeline or custom tooling.`,
    code: `// Analyze a repository
POST /api/repository/analyze
{
  "url": "github.com/user/repo",
  "deep": true
}

// Chat with your codebase
POST /api/chat/stream
{
  "message": "Explain the auth module",
  "repositoryId": "repo_abc123",
  "conversationId": "conv_xyz789"   // optional
}

// Get analysis results
GET /api/repository/:id/overview
GET /api/repository/:id/files
GET /api/repository/:id/review`,
  },
  {
    icon: Settings,
    title: "Supported Platforms",
    content: `Repo Verify currently supports GitHub repositories. GitLab and Bitbucket support is on our roadmap for Q3 2026.`,
    items: [
      "GitHub Public Repositories",
      "GitHub Private Repositories (OAuth)",
      "GitHub Enterprise (SSO)",
      "GitLab (coming soon)",
      "Bitbucket (coming soon)",
    ],
  },
];

export default function DocsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen font-[Inter] transition-colors duration-300 ${isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900"}`}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/5 rounded-full blur-[150px]" />
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-20 right-[15%] h-64 w-64 rounded-full bg-violet-500/[0.04] blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute bottom-32 left-[10%] h-48 w-48 rounded-full bg-fuchsia-500/[0.04] blur-[80px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <motion.div variants={itemVariants} className="mb-10">
          <Link to="/" className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-14 text-center">
          <motion.div variants={badgeVariants} className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${isDark ? "border-violet-500/20 bg-violet-500/10 text-violet-300" : "border-violet-200 bg-violet-100 text-violet-700"}`}>
            <BookOpen size={14} className="text-violet-400" /> Documentation
          </motion.div>
          <h1 className="font-[Outfit] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Build with{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]">Repo Verify</span>
          </h1>
          <p className={`mx-auto mt-5 max-w-xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Everything you need to analyze, review, and document your codebase with AI.
          </p>
        </motion.div>

        <motion.div variants={pageVariants} className="space-y-10">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`rounded-2xl border p-6 sm:p-8 transition-shadow duration-300 ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:shadow-violet-500/5" : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? "bg-violet-500/10" : "bg-violet-100"}`}
                  >
                    <Icon size={18} className="text-violet-500" />
                  </motion.div>
                  <h2 className={`font-[Outfit] text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{section.title}</h2>
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{section.content}</p>

                {section.steps && (
                  <div className="space-y-3">
                    {section.steps.map((step, si) => (
                      <motion.div
                        key={si}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`flex gap-4 rounded-xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white"
                        >{si + 1}</motion.div>
                        <div>
                          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{step.label}</p>
                          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{step.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {section.code && (
                  <motion.pre
                    whileHover={{ borderColor: "rgba(139, 92, 246, 0.3)" }}
                    className={`rounded-xl border p-5 text-[13px] leading-6 overflow-x-auto transition-all duration-300 ${isDark ? "border-white/[0.06] bg-[#0c101c] text-slate-300" : "border-slate-200 bg-slate-900 text-slate-300"}`}
                  >
                    <code>{section.code}</code>
                  </motion.pre>
                )}

                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <motion.li
                        key={item}
                        whileHover={{ x: 4 }}
                        className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}
                      >
                        <motion.span
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 2, delay: Math.random() * 2 }}
                          className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0"
                        />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, boxShadow: "0 20px 60px -12px rgba(139, 92, 246, 0.15)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`mt-16 rounded-2xl border p-8 text-center ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"}`}
        >
          <h3 className="font-[Outfit] text-xl font-bold mb-2">Ready to get started?</h3>
          <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Analyze your first repository in under 2 minutes.</p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transition-all">
              Get Started Free <ExternalLink size={14} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
}
