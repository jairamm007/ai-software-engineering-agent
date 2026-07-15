import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, LifeBuoy, Code2, Mail, MessageCircle, FileQuestion, ExternalLink } from "lucide-react";

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

export default function SupportPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const channels = [
    {
      icon: Code2,
      title: "GitHub Issues",
      desc: "Report bugs, request features, or browse known issues.",
      action: "Open Issues",
      href: "https://github.com/anomalyco/opencode/issues",
      color: "from-slate-600 to-slate-800",
    },
    {
      icon: Mail,
      title: "Email Support",
      desc: "For account issues, billing, or private inquiries.",
      action: "support@repo-verify.dev",
      href: "mailto:support@repo-verify.dev",
      color: "from-violet-500 to-fuchsia-600",
    },
    {
      icon: MessageCircle,
      title: "Community Discord",
      desc: "Join 2,000+ developers discussing AI-powered code analysis.",
      action: "Join Discord",
      href: "#",
      color: "from-indigo-500 to-blue-600",
    },
  ];

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen font-[Inter] transition-colors duration-300 ${isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900"}`}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-600/4 rounded-full blur-[150px]" />
        <motion.div
          animate={{ y: [0, -22, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute top-28 left-[18%] h-48 w-48 rounded-full bg-amber-500/[0.04] blur-[85px]"
        />
        <motion.div
          animate={{ y: [0, 16, 0], x: [0, -14, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute bottom-36 right-[12%] h-56 w-56 rounded-full bg-violet-500/[0.04] blur-[95px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <motion.div variants={itemVariants} className="mb-10">
          <Link to="/" className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-14 text-center">
          <motion.div variants={badgeVariants} className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${isDark ? "border-amber-500/20 bg-amber-500/10 text-amber-300" : "border-amber-200 bg-amber-100 text-amber-700"}`}>
            <LifeBuoy size={14} className="text-amber-400" /> Support
          </motion.div>
          <h1 className="font-[Outfit] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            How Can We{" "}
            <span className="bg-gradient-to-r from-amber-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]">Help</span>?
          </h1>
          <p className={`mx-auto mt-5 max-w-xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Choose the best channel to reach us. We aim to respond within 24 hours.
          </p>
        </motion.div>

        <motion.div variants={pageVariants} className="grid gap-5 sm:grid-cols-3 mb-12">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <motion.a
                key={ch.title}
                href={ch.href}
                target={ch.href.startsWith("http") ? "_blank" : undefined}
                rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`group rounded-2xl border p-6 text-center transition-shadow duration-300 hover:shadow-xl ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-amber-500/5" : "border-slate-200 bg-white hover:shadow-slate-200/60"}`}
              >
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${ch.color} text-white shadow-md`}
                >
                  <Icon size={20} />
                </motion.div>
                <h3 className={`font-[Outfit] text-base font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>{ch.title}</h3>
                <p className={`text-xs mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{ch.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-violet-500 group-hover:text-violet-400 transition-colors">
                  {ch.action} <ExternalLink size={12} />
                </span>
              </motion.a>
            );
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`rounded-2xl border p-6 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}
        >
          <div className="flex items-start gap-3">
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 400 }}>
              <FileQuestion size={20} className="mt-0.5 shrink-0 text-violet-500" />
            </motion.div>
            <div>
              <h3 className={`font-[Outfit] text-base font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Before you report...</h3>
              <ul className={`text-sm space-y-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <li>• Check the <Link to="/faq" className="text-violet-500 hover:text-violet-400 font-medium">FAQ</Link> for common questions</li>
                <li>• Search existing <a href="https://github.com/anomalyco/opencode/issues" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-400 font-medium">GitHub Issues</a> to avoid duplicates</li>
                <li>• Include your browser, OS, and steps to reproduce when filing a bug</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}
