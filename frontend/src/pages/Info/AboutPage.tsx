import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Users, Target, Layers, Zap, Code2, Sparkles } from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 18 } },
};

const stack = [
  { name: "React 19", desc: "Modern UI with server components" },
  { name: "TypeScript", desc: "End-to-end type safety" },
  { name: "Tailwind CSS 4", desc: "Utility-first styling" },
  { name: "Vite", desc: "Lightning-fast build tooling" },
  { name: "Express + Prisma", desc: "Type-safe API layer" },
  { name: "LangChain", desc: "AI orchestration framework" },
  { name: "Google GenAI / OpenAI", desc: "LLM inference providers" },
  { name: "PostgreSQL", desc: "Relational data storage" },
];

const values = [
  { icon: Target, title: "Developer-First", desc: "Every feature is designed to save developers time. No bloat, no friction — just fast, accurate AI that understands your code." },
  { icon: Zap, title: "Speed Matters", desc: "From repository indexing to AI responses, we obsess over latency. Your workflow shouldn't wait for slow tools." },
  { icon: Layers, title: "Deep Understanding", desc: "We don't just scan files — we build a semantic model of your entire codebase, understanding relationships and architecture." },
];

export default function AboutPage() {
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
          animate={{ y: [0, -28, 0], x: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute top-36 right-[22%] h-60 w-60 rounded-full bg-violet-500/[0.04] blur-[95px]"
        />
        <motion.div
          animate={{ y: [0, 22, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute bottom-28 left-[8%] h-44 w-44 rounded-full bg-fuchsia-500/[0.04] blur-[75px]"
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
            <Users size={14} className="text-violet-400" /> About Us
          </motion.div>
          <h1 className="font-[Outfit] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            The{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]">Problem</span>{" "}
            We're Solving
          </h1>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
          className={`rounded-2xl border p-8 mb-12 transition-shadow duration-300 ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:shadow-violet-500/5" : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"}`}
        >
          <p className={`text-lg leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Every day, developers spend hours reading unfamiliar codebases — onboarding to new projects, reviewing pull requests, or trying to understand legacy systems. The code already exists, but understanding it is the bottleneck.
          </p>
          <p className={`text-lg leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            <strong className={isDark ? "text-white" : "text-slate-900"}>Repo Verify</strong> changes that. Paste any GitHub repository URL, and our AI agent reads, indexes, and understands your entire codebase. Then you can ask it anything — explain the architecture, review code, generate docs, or find bugs — all in natural language.
          </p>
        </motion.div>

        <motion.div variants={pageVariants} className="grid gap-5 sm:grid-cols-3 mb-12">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring" as const, stiffness: 300, damping: 22 }}
                className={`rounded-2xl border p-6 transition-shadow duration-300 ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:shadow-violet-500/5" : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"}`}
              >
                <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: "spring" as const, stiffness: 400 }}>
                  <Icon size={20} className="text-violet-500 mb-3" />
                </motion.div>
                <h3 className={`font-[Outfit] text-base font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{v.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{v.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
          className={`rounded-2xl border p-8 mb-12 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
        >
          <h2 className={`font-[Outfit] text-xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Tech Stack</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {stack.map((s) => (
              <motion.div
                key={s.name}
                whileHover={{ x: 4, scale: 1.01 }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                className={`flex items-center gap-3 rounded-xl border p-3 ${isDark ? "border-white/[0.04] bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}
              >
                <motion.div whileHover={{ rotate: 90 }} transition={{ type: "spring" as const, stiffness: 400 }}>
                  <Sparkles size={14} className="shrink-0 text-violet-500" />
                </motion.div>
                <div>
                  <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{s.name}</span>
                  <span className={`text-xs ml-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{s.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, boxShadow: "0 20px 60px -12px rgba(139, 92, 246, 0.12)" }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
          className={`rounded-2xl border p-8 text-center ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"}`}
        >
          <h3 className="font-[Outfit] text-xl font-bold mb-2">Open Source at Heart</h3>
          <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>We believe in building in the open. Check out our code on GitHub.</p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <a href="https://github.com/anomalyco/opencode" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:shadow-md">
              <Code2 size={16} /> View on GitHub
            </a>
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
}
