import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Heart, GitPullRequest, Code2, MessageCircle, Shield, ExternalLink } from "lucide-react";

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

const guidelines = [
  {
    icon: GitPullRequest,
    title: "Pull Requests",
    desc: "Fork the repo, create a feature branch, and submit a PR against `main`. We aim to review within 48 hours. Keep PRs focused — one feature or fix per PR.",
  },
  {
    icon: Code2,
    title: "Code Style",
    desc: "We use TypeScript with strict mode, ESLint, and Prettier. Run `npm run lint` before submitting. Follow existing patterns in the codebase.",
  },
  {
    icon: MessageCircle,
    title: "Communication",
    desc: "Open an issue first for large features. For bugs, include reproduction steps, browser/OS info, and screenshots if applicable.",
  },
  {
    icon: Shield,
    title: "Code of Conduct",
    desc: "Be respectful, constructive, and inclusive. We follow the Contributor Covenant. Harassment or discrimination of any kind will not be tolerated.",
  },
];

const goodFirstIssues = [
  "Add keyboard shortcuts for repository navigation",
  "Implement dark/light theme toggle animation",
  "Add export options for documentation (PDF, HTML)",
  "Improve mobile responsiveness for dashboard sidebar",
  "Add loading skeleton placeholders for repository list",
];

export default function CareersPage() {
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-pink-600/4 rounded-full blur-[150px]" />
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 16, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-20 left-[20%] h-52 w-52 rounded-full bg-pink-500/[0.04] blur-[90px]"
        />
        <motion.div
          animate={{ y: [0, 24, 0], x: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }}
          className="absolute bottom-32 right-[15%] h-48 w-48 rounded-full bg-violet-500/[0.04] blur-[80px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <motion.div variants={itemVariants} className="mb-10">
          <Link to="/" className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-14 text-center">
          <motion.div variants={badgeVariants} className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${isDark ? "border-pink-500/20 bg-pink-500/10 text-pink-300" : "border-pink-200 bg-pink-100 text-pink-700"}`}>
            <Heart size={14} className="text-pink-400" /> Contribute
          </motion.div>
          <h1 className="font-[Outfit] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Build with{" "}
            <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]">Us</span>
          </h1>
          <p className={`mx-auto mt-5 max-w-xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Repo Verify is open source. We welcome contributions from developers of all skill levels.
          </p>
        </motion.div>

        <motion.div variants={pageVariants} className="grid gap-5 sm:grid-cols-2 mb-12">
          {guidelines.map((g) => {
            const Icon = g.icon;
            return (
              <motion.div
                key={g.title}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`rounded-2xl border p-6 transition-shadow duration-300 ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:shadow-pink-500/5" : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"}`}
              >
                <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Icon size={20} className="text-pink-500 mb-3" />
                </motion.div>
                <h3 className={`font-[Outfit] text-base font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{g.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{g.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`rounded-2xl border p-8 mb-12 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
        >
          <h2 className={`font-[Outfit] text-xl font-bold mb-5 ${isDark ? "text-white" : "text-slate-900"}`}>Good First Issues</h2>
          <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Looking for a place to start? These issues are tagged for new contributors:</p>
          <ul className="space-y-2.5">
            {goodFirstIssues.map((issue, i) => (
              <motion.li
                key={issue}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                whileHover={{ x: 6, scale: 1.01 }}
                className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${isDark ? "border-white/[0.04] bg-white/[0.02] text-slate-300" : "border-slate-100 bg-slate-50 text-slate-600"}`}
              >
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  className="h-1.5 w-1.5 rounded-full bg-pink-500 shrink-0"
                />
                {issue}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, boxShadow: "0 20px 60px -12px rgba(139, 92, 246, 0.15)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`rounded-2xl border p-8 text-center ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"}`}
        >
          <h3 className="font-[Outfit] text-xl font-bold mb-2">Ready to contribute?</h3>
          <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Star the repo, pick an issue, and open your first PR today.</p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <a href="https://github.com/anomalyco/opencode" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all">
              <Code2 size={16} /> View Repository <ExternalLink size={14} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
}
