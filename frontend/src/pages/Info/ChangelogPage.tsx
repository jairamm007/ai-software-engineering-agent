import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, History, Tag, Plus, Sparkles, Wrench, Shield } from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20, y: 20 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 18 } },
};

const dotVariants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { type: "spring" as const, stiffness: 400, damping: 15 } },
};

const releases = [
  {
    version: "v0.4.0",
    date: "June 2026",
    icon: Sparkles,
    color: "text-violet-500 bg-violet-500/10",
    changes: [
      "AI Chat with context-aware conversations across entire repositories",
      "Real-time streaming responses for instant feedback",
      "Conversation history and session management",
      "Support for 50+ programming languages in code analysis",
    ],
  },
  {
    version: "v0.3.0",
    date: "May 2026",
    icon: Wrench,
    color: "text-fuchsia-500 bg-fuchsia-500/10",
    changes: [
      "Automated test-fix loop for continuous code improvement",
      "Dependency graph visualization with interactive node explorer",
      "Architecture diagram generation from codebase structure",
      "Performance: 3x faster repository indexing pipeline",
    ],
  },
  {
    version: "v0.2.0",
    date: "April 2026",
    icon: Shield,
    color: "text-emerald-500 bg-emerald-500/10",
    changes: [
      "Security vulnerability scanning with CVE database integration",
      "Code review with inline suggestions and confidence scores",
      "Dark mode and light mode support",
      "GitHub OAuth and Google sign-in",
    ],
  },
  {
    version: "v0.1.0",
    date: "March 2026",
    icon: Plus,
    color: "text-cyan-500 bg-cyan-500/10",
    changes: [
      "Initial launch — core repository analysis engine",
      "File-level code chunking and semantic embedding",
      "Dashboard with repository management",
      "Basic documentation generation",
    ],
  },
];

export default function ChangelogPage() {
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-600/4 rounded-full blur-[150px]" />
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-24 right-[20%] h-52 w-52 rounded-full bg-emerald-500/[0.04] blur-[90px]"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -18, 0] }}
          transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }}
          className="absolute bottom-40 left-[15%] h-44 w-44 rounded-full bg-violet-500/[0.04] blur-[80px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <motion.div variants={itemVariants} className="mb-10">
          <Link to="/" className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-14 text-center">
          <motion.div variants={badgeVariants} className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-100 text-emerald-700"}`}>
            <History size={14} className="text-emerald-400" /> Changelog
          </motion.div>
          <h1 className="font-[Outfit] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            What's{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]">New</span>
          </h1>
          <p className={`mx-auto mt-5 max-w-xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            A timeline of features, improvements, and fixes.
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
            className={`absolute left-5 top-0 bottom-0 w-px origin-top ${isDark ? "bg-white/[0.06]" : "bg-slate-200"}`}
          />

          <motion.div variants={pageVariants} className="space-y-10">
            {releases.map((release) => {
              const Icon = release.icon;
              return (
                <motion.div key={release.version} variants={itemVariants} className="relative pl-12">
                  <motion.div
                    variants={dotVariants}
                    whileHover={{ scale: 1.4 }}
                    className={`absolute left-3 top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ${isDark ? "bg-slate-900 ring-[#07030F]" : "bg-white ring-white"}`}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                      className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600"
                    />
                  </motion.div>

                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1 text-sm font-bold ${release.color}`}
                    >
                      <Icon size={14} /> {release.version}
                    </motion.div>
                    <span className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>{release.date}</span>
                  </div>

                  <ul className="space-y-2">
                    {release.changes.map((change) => (
                      <motion.li
                        key={change}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                        className={`flex items-start gap-2.5 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}
                      >
                        <Tag size={12} className="mt-1 shrink-0 text-violet-400" />
                        {change}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}
