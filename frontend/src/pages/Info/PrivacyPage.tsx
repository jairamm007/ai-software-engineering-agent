import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Shield, Lock, Eye, Trash2, Database, Globe } from "lucide-react";

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
    icon: Database,
    title: "Data We Collect",
    content: `When you use Repo Verify, we collect the following information:

• Account information: name, email address, and profile image (from OAuth providers like GitHub and Google).
• Repository data: When you analyze a repository, we clone it temporarily, index file structures, and generate semantic embeddings. Raw source code is not stored permanently — only mathematical representations (embeddings) used for AI search.
• Usage analytics: Pages visited, features used, and interaction patterns — anonymized and used to improve the product.
• API logs: Request/response metadata for debugging and performance monitoring (retained for 30 days).`,
  },
  {
    icon: Lock,
    title: "How We Protect Your Data",
    content: `• All data is encrypted in transit (TLS 1.3) and at rest (AES-256).
• Repository analysis runs in isolated, ephemeral environments that are destroyed after processing.
• We use SOC 2 Type II compliant infrastructure (AWS/GCP).
• Access to user data is restricted to authorized personnel only, with audit logging.
• We never sell, share, or monetize your source code or repository data with third parties.`,
  },
  {
    icon: Eye,
    title: "AI and Your Code",
    content: `• Our AI models (GPT-4, Claude) process your code to generate analyses, reviews, and documentation.
• Code sent to AI providers is processed ephemerally and not used for model training.
• Embeddings generated from your code are stored securely and are not reversible to raw source code.
• You can request a full data export or deletion at any time from your dashboard settings.`,
  },
  {
    icon: Trash2,
    title: "Data Retention & Deletion",
    content: `• Repository embeddings: Retained until you delete the repository from your dashboard.
• Account data: Retained as long as your account is active. Deleted within 30 days of account closure.
• API logs: Automatically purged after 30 days.
• Session data: Cleared when you sign out. JWT tokens expire after 7 days.
• You can request immediate deletion of all your data by contacting support@repo-verify.dev.`,
  },
  {
    icon: Globe,
    title: "Cookies & Tracking",
    content: `• Essential cookies: Session management and authentication (required).
• Analytics cookies: Anonymous usage tracking via our own analytics (optional, can be disabled).
• We do not use third-party advertising cookies or trackers.
• You can manage cookie preferences in your browser settings.`,
  },
];

export default function PrivacyPage() {
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-600/4 rounded-full blur-[150px]" />
        <motion.div
          animate={{ y: [0, -18, 0], x: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute top-40 right-[16%] h-52 w-52 rounded-full bg-cyan-500/[0.04] blur-[85px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, 14, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute bottom-28 left-[12%] h-44 w-44 rounded-full bg-violet-500/[0.04] blur-[75px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <motion.div variants={itemVariants} className="mb-10">
          <Link to="/" className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-14 text-center">
          <motion.div variants={badgeVariants} className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${isDark ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300" : "border-cyan-200 bg-cyan-100 text-cyan-700"}`}>
            <Shield size={14} className="text-cyan-400" /> Privacy Policy
          </motion.div>
          <h1 className="font-[Outfit] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Your Data,{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]">Your Control</span>
          </h1>
          <p className={`mx-auto mt-5 max-w-xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Last updated: June 2026. We believe in transparency about what we collect and why.
          </p>
        </motion.div>

        <motion.div variants={pageVariants} className="space-y-10">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`rounded-2xl border p-6 sm:p-8 transition-shadow duration-300 ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:shadow-cyan-500/5" : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? "bg-cyan-500/10" : "bg-cyan-100"}`}
                  >
                    <Icon size={18} className="text-cyan-500" />
                  </motion.div>
                  <h2 className={`font-[Outfit] text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{section.title}</h2>
                </div>
                <div className={`rounded-xl border p-5 text-sm leading-relaxed whitespace-pre-line ${isDark ? "border-white/[0.06] bg-white/[0.02] text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                  {section.content}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`mt-12 rounded-2xl border p-6 text-center ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"}`}
        >
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Questions about your privacy? Contact us at{" "}
            <a href="mailto:privacy@repo-verify.dev" className="text-violet-500 hover:text-violet-400 font-medium">privacy@repo-verify.dev</a>
          </p>
        </motion.div>
      </div>
    </motion.main>
  );
}
