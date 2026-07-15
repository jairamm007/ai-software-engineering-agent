import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Code2, FileSearch, GitBranch, MessageSquare, Shield, BookOpen } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const features = [
  {
    icon: Code2,
    title: "AI Code Review",
    description: "Automated code review powered by AI that catches bugs, suggests improvements, and enforces best practices across your codebase.",
    gradient: "from-violet-500 to-purple-600",
    glow: "group-hover:shadow-violet-500/25",
    accent: "bg-violet-500",
  },
  {
    icon: FileSearch,
    title: "Smart Analysis",
    description: "Deep repository analysis that understands your code structure, dependencies, and patterns to provide contextual insights.",
    gradient: "from-fuchsia-500 to-pink-600",
    glow: "group-hover:shadow-fuchsia-500/25",
    accent: "bg-fuchsia-500",
  },
  {
    icon: GitBranch,
    title: "Architecture Mapping",
    description: "Visualize your repository architecture with automatic dependency graphs and module relationship mapping.",
    gradient: "from-cyan-500 to-blue-600",
    glow: "group-hover:shadow-cyan-500/25",
    accent: "bg-cyan-500",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Chat with your repository. Ask questions about code, get explanations, and receive guided walkthroughs powered by AI.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "group-hover:shadow-emerald-500/25",
    accent: "bg-emerald-500",
  },
  {
    icon: BookOpen,
    title: "Auto Documentation",
    description: "Generate comprehensive documentation for your entire codebase including API references, module docs, and usage guides.",
    gradient: "from-orange-500 to-red-600",
    glow: "group-hover:shadow-orange-500/25",
    accent: "bg-orange-500",
  },
  {
    icon: Shield,
    title: "Security Scanning",
    description: "Identify vulnerabilities, exposed secrets, and security anti-patterns before they make it to production.",
    gradient: "from-amber-500 to-yellow-600",
    glow: "group-hover:shadow-amber-500/25",
    accent: "bg-amber-500",
  },
];

const directionVariants = [
  { hidden: { opacity: 0, y: 60, x: -20, rotate: -2 }, visible: { opacity: 1, y: 0, x: 0, rotate: 0 } },
  { hidden: { opacity: 0, y: 60, x: 0, rotate: 1 }, visible: { opacity: 1, y: 0, x: 0, rotate: 0 } },
  { hidden: { opacity: 0, y: 60, x: 20, rotate: -1 }, visible: { opacity: 1, y: 0, x: 0, rotate: 0 } },
  { hidden: { opacity: 0, y: 60, x: -15, rotate: 2 }, visible: { opacity: 1, y: 0, x: 0, rotate: 0 } },
  { hidden: { opacity: 0, y: 60, x: 10, rotate: -1 }, visible: { opacity: 1, y: 0, x: 0, rotate: 0 } },
  { hidden: { opacity: 0, y: 60, x: -10, rotate: 1.5 }, visible: { opacity: 1, y: 0, x: 0, rotate: 0 } },
];

export default function Features() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section id="features" ref={sectionRef} className="relative px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32 overflow-hidden">
      {/* Floating background orb */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px]"
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
            Powerful Features
          </motion.span>
          <h2 className={`mt-5 font-[Outfit] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl ${isDark ? "" : "text-slate-900"}`}>
            Everything You Need to{" "}
            <span className={`${isDark ? "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400" : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"} bg-clip-text text-transparent`}>
              Ship Faster
            </span>
          </h2>
          <p className={`mx-auto mt-6 max-w-2xl text-lg font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            A complete AI-powered toolkit for understanding, reviewing, and improving your software repositories.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const variant = directionVariants[index % directionVariants.length];

            return (
              <motion.div
                key={feature.title}
                initial={variant.hidden}
                whileInView={variant.visible}
                viewport={{ once: false, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`group relative h-full rounded-2xl border p-6 transition-shadow duration-300 sm:p-7 md:p-8 hover:shadow-2xl ${feature.glow} ${
                  isDark
                    ? "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
                    : "border-slate-200 bg-white shadow-md shadow-slate-200/50 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
                }`}
              >
                {/* Accent line at top */}
                <div className={`absolute top-0 left-6 right-6 h-px ${feature.accent} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />

                {/* Icon with glow ring */}
                <div className="relative mb-5 inline-flex">
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300`} />
                  <div className={`relative rounded-xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                </div>

                <h3 className={`mb-3 font-[Outfit] text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
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
        </div>
      </div>
    </section>
  );
}
