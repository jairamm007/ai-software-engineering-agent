import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { GitBranch, Cpu, FileSearch, MessageSquare, ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const steps = [
  {
    icon: GitBranch,
    step: "01",
    title: "Connect Repository",
    description: "Paste your GitHub URL. Our agent clones, parses, and indexes every file in your repository.",
    iconColor: "text-violet-500",
    glowColor: "shadow-violet-500/30",
    bgAccent: "from-violet-500/10 to-transparent",
    slideFrom: "left" as const,
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analysis",
    description: "AI models generate embeddings, map architecture, review code, and build a knowledge base of your project.",
    iconColor: "text-fuchsia-500",
    glowColor: "shadow-fuchsia-500/30",
    bgAccent: "from-fuchsia-500/10 to-transparent",
    slideFrom: "right" as const,
  },
  {
    icon: FileSearch,
    step: "03",
    title: "Explore & Discover",
    description: "Browse dependency graphs, file structures, code reviews, and architecture diagrams — all generated automatically.",
    iconColor: "text-cyan-500",
    glowColor: "shadow-cyan-500/30",
    bgAccent: "from-cyan-500/10 to-transparent",
    slideFrom: "left" as const,
  },
  {
    icon: MessageSquare,
    step: "04",
    title: "Chat & Act",
    description: "Ask questions about your code, request changes, generate documentation, and get instant AI-powered answers.",
    iconColor: "text-emerald-500",
    glowColor: "shadow-emerald-500/30",
    bgAccent: "from-emerald-500/10 to-transparent",
    slideFrom: "right" as const,
  },
];

function StepCard({ step, index, isDark }: { step: (typeof steps)[number]; index: number; isDark: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end center"] });
  const lineScale = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  const Icon = step.icon;
  const isLeft = step.slideFrom === "left";

  return (
    <div ref={cardRef} className="relative">
      {/* Connecting animated line to next step */}
      {index < steps.length - 1 && (
        <div className="absolute left-7 top-20 bottom-0 w-px z-0">
          <motion.div
            style={{ scaleY: lineScale, originY: 0 }}
            className={`w-full ${isDark ? "bg-gradient-to-b from-white/10 to-white/5" : "bg-gradient-to-b from-slate-200 to-slate-100"}`}
          />
        </div>
      )}

      {/* Step row */}
      <motion.div
        initial={{
          opacity: 0,
          x: isLeft ? -80 : 80,
          filter: "blur(8px)",
        }}
        whileInView={{
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
        }}
        viewport={{ once: false, margin: "-60px" }}
        transition={{
          duration: 0.7,
          delay: 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`relative flex items-start gap-6 sm:gap-8 ${isLeft ? "" : "flex-row-reverse"}`}
      >
        {/* Icon circle */}
        <div className="relative z-10 shrink-0">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 shadow-lg ${step.glowColor} ${
              isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}
          >
            <Icon size={24} className={step.iconColor} />
          </motion.div>
        </div>

        {/* Content card */}
        <div className={`flex-1 pb-14 ${isLeft ? "" : "text-right"}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl border p-6 sm:p-7 transition-all duration-300 ${
              isDark
                ? "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl"
            }`}
          >
            {/* Background accent gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.bgAccent} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`} />

            <div className="relative">
              <div className={`flex items-center gap-3 mb-3 ${isLeft ? "" : "flex-row-reverse"}`}>
                <span className={`text-xs font-bold uppercase tracking-widest ${step.iconColor}`}>
                  Step {step.step}
                </span>
                <ArrowRight size={12} className={`${step.iconColor} ${isLeft ? "" : "rotate-180"}`} />
              </div>
              <h3 className="mb-3 font-[Outfit] text-xl font-bold sm:text-2xl">{step.title}</h3>
              <p className={`text-sm leading-relaxed sm:text-base font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {step.description}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Workflow() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32 overflow-hidden">
      {/* Floating background orb */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute right-0 top-1/4 w-[500px] h-[500px] bg-fuchsia-600/5 rounded-full blur-[140px]"
      />

      <div className="mx-auto max-w-4xl relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-20 text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
            className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
              isDark ? "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300" : "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
            </span>
            How It Works
          </motion.span>
          <h2 className={`mt-5 font-[Outfit] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl ${isDark ? "" : "text-slate-900"}`}>
            From Repo to{" "}
            <span className={`${isDark ? "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-pink-400" : "bg-gradient-to-r from-fuchsia-600 via-violet-600 to-pink-600"} bg-clip-text text-transparent`}>
              Insight
            </span>{" "}
            in Minutes
          </h2>
          <p className={`mx-auto mt-6 max-w-2xl text-lg font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Four simple steps to unlock the full potential of your codebase with AI.
          </p>
        </motion.div>

        {/* Steps with animated timeline */}
        <div className="relative">
          {steps.map((step, index) => (
            <StepCard key={step.step} step={step} index={index} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  );
}
