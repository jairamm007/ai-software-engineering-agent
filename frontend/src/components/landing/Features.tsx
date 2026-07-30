import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Network,
  Code2,
  BookOpen,
  Building2,
  MessageSquareText,
  MessageCircle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const features = [
  {
    icon: Network,
    title: "Smart Repository Analysis",
    description: "Deep analysis of your entire repository — code structure, dependencies, patterns, and conventions. The AI indexes every file with vector embeddings for semantic understanding.",
    gradient: "from-violet-500 to-purple-600",
    glow: "group-hover:shadow-violet-500/25",
    accent: "bg-violet-500",
    badge: "Analyze",
  },
  {
    icon: Code2,
    title: "AI Code Review",
    description: "Automated pull request reviews that catch bugs, security issues, and code smells. Get actionable feedback with suggested fixes before merging.",
    gradient: "from-blue-500 to-cyan-600",
    glow: "group-hover:shadow-blue-500/25",
    accent: "bg-blue-500",
    badge: "Review",
  },
  {
    icon: BookOpen,
    title: "Documentation Generator",
    description: "Auto-generate README files, API documentation, inline code docs, and changelogs. Keep your documentation in sync with your codebase.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "group-hover:shadow-emerald-500/25",
    accent: "bg-emerald-500",
    badge: "Docs",
  },
  {
    icon: Building2,
    title: "Architecture Visualization",
    description: "Visualize your project's architecture — module dependencies, data flow, directory structure, and component relationships in an interactive graph.",
    gradient: "from-orange-500 to-amber-600",
    glow: "group-hover:shadow-orange-500/25",
    accent: "bg-orange-500",
    badge: "Map",
  },
  {
    icon: MessageSquareText,
    title: "Code Explanation",
    description: "Understand any code instantly. Get plain-English explanations with logic flow, time complexity, design patterns, and suggestions for improvement.",
    gradient: "from-cyan-500 to-blue-600",
    glow: "group-hover:shadow-cyan-500/25",
    accent: "bg-cyan-500",
    badge: "Learn",
  },
  {
    icon: MessageCircle,
    title: "Chat With Repository",
    description: "Ask questions about your codebase in natural language. Find functions, understand logic, debug issues, and explore your repository — just by asking.",
    gradient: "from-pink-500 to-rose-600",
    glow: "group-hover:shadow-pink-500/25",
    accent: "bg-pink-500",
    badge: "Chat",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Features() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="features" ref={sectionRef} className="relative px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32 overflow-hidden">
      {/* Floating background orbs */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute left-0 top-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[150px]"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-40, 40]) }}
        className="pointer-events-none absolute right-0 bottom-1/4 w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[120px]"
      />

      <div className="mx-auto max-w-7xl relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
            className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
              isDark ? "border-violet-500/20 bg-violet-500/10 text-violet-300" : "border-violet-200 bg-violet-100 text-violet-700"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            6 Core Features
          </motion.span>
          <h2 className={`mt-5 font-[Outfit] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl ${isDark ? "" : "text-slate-900"}`}>
            Analyze, Document,{" "}
            <span className={`${isDark ? "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400" : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"} bg-clip-text text-transparent`}>
              & Understand Code
            </span>
          </h2>
          <p className={`mx-auto mt-6 max-w-2xl text-lg font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            AI-powered tools that analyze, review, document, and explain your entire repository.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-40px" }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative h-full rounded-2xl border p-6 transition-all duration-300 sm:p-7 hover:shadow-2xl ${feature.glow} ${
                  isDark
                    ? "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
                    : "border-slate-200 bg-white shadow-md shadow-slate-200/50 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
                }`}
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                {/* Accent line at top */}
                <div className={`absolute top-0 left-6 right-6 h-px ${feature.accent} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />

                {/* Badge */}
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-4 ${
                  isDark ? "bg-white/[0.06] text-slate-400" : "bg-slate-100 text-slate-500"
                }`}>
                  {feature.badge}
                </span>

                {/* Icon with glow ring */}
                <div className="relative mb-4 inline-flex">
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300`} />
                  <div className={`relative rounded-xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>

                <h3 className={`mb-2 font-[Outfit] text-base font-semibold sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {feature.description}
                </p>

                {/* Bottom shimmer line */}
                <div className={`absolute bottom-0 left-0 h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent ${feature.accent} to-transparent transition-all duration-700`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feature grid footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className={`mt-10 text-center text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          From deep repository analysis to AI-powered documentation — everything you need to understand your codebase.
        </motion.p>
      </div>
    </section>
  );
}
