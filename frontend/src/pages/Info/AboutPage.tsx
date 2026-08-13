import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import PlexusTerrainBackground from "@/components/landing/PlexusTerrainBackground";
import GradientOrbs from "@/components/motion/GradientOrbs";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import SpotlightCard from "@/components/motion/SpotlightCard";
import Magnetic from "@/components/motion/Magnetic";
import PageHero from "@/components/motion/PageHero";
import ScrollProgress from "@/components/motion/ScrollProgress";
import BackToTop from "@/components/motion/BackToTop";
import CTACard from "@/components/motion/CTACard";
import { glassCard } from "@/components/motion/styles";
import { Users, Target, Zap, Layers, Code2, Sparkles, Rocket, Cpu } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Developer-First",
    desc: "Every feature is designed to save developers time. No bloat, no friction — just fast, accurate AI that understands your code.",
  },
  {
    icon: Zap,
    title: "Speed Matters",
    desc: "From repository indexing to AI responses, we obsess over latency. Your workflow shouldn't wait for slow tools.",
  },
  {
    icon: Layers,
    title: "Deep Understanding",
    desc: "We don't just scan files — we build a semantic model of your entire codebase, understanding relationships and architecture.",
  },
];

const stack = [
  { name: "React 19", desc: "Modern UI with server components", icon: Rocket },
  { name: "TypeScript", desc: "End-to-end type safety", icon: Code2 },
  { name: "Tailwind CSS 4", desc: "Utility-first styling", icon: Sparkles },
  { name: "Vite", desc: "Lightning-fast build tooling", icon: Zap },
  { name: "Express + Prisma", desc: "Type-safe API layer", icon: Cpu },
  { name: "LangChain", desc: "AI orchestration framework", icon: Layers },
  { name: "Google GenAI / OpenAI", desc: "LLM inference providers", icon: Sparkles },
  { name: "PostgreSQL", desc: "Relational data storage", icon: Cpu },
];

export default function AboutPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("min-h-screen font-[Inter] transition-colors duration-300", isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900")}
    >
      <PlexusTerrainBackground />
      <GradientOrbs />
      <ScrollProgress />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <PageHero
          icon={Users}
          label="About Us"
          badgeClass={isDark ? "border-violet-500/20 bg-violet-500/10 text-violet-300" : "border-violet-200 bg-violet-100 text-violet-700"}
          titleBefore={["The"]}
          gradientWord="Problem"
          titleAfter={["We're", "Solving"]}
          subtitle="Every hour a developer spends decoding an unfamiliar codebase is an hour lost to busywork. Repo Verify exists to give that time back."
          gradientClass="from-violet-400 via-fuchsia-400 to-pink-400"
          glowClass="rgba(139, 92, 246, 0.14)"
        />

        <Reveal delay={0.05}>
          <TiltCard glareOpacity={0.08} tiltMax={4} scale={1.01}>
            <div className={cn("rounded-2xl border p-8", glassCard(isDark))}>
              <p className={cn("mb-4 text-lg leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
                Every day, developers spend hours reading unfamiliar codebases — onboarding to new projects, reviewing pull requests, or trying to understand legacy systems. The code already exists, but understanding it is the bottleneck.
              </p>
              <p className={cn("text-lg leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
                <strong className={isDark ? "text-white" : "text-slate-900"}>Repo Verify</strong> changes that. Paste any GitHub repository URL, and our AI agent reads, indexes, and understands your entire codebase. Then you can ask it anything — explain the architecture, review code, generate docs, or find bugs — all in natural language.
              </p>
            </div>
          </TiltCard>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <Reveal key={v.title} delay={0.08 + i * 0.1} y={34} className="h-full">
                <SpotlightCard
                  spotlightColor={isDark ? "rgba(139, 92, 246, 0.16)" : "rgba(139, 92, 246, 0.12)"}
                  className={cn("h-full rounded-2xl border transition-shadow duration-300", glassCard(isDark), isDark ? "hover:shadow-xl hover:shadow-violet-500/10" : "hover:shadow-xl hover:shadow-slate-200/60")}
                  innerClassName="h-full p-6"
                >
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.12 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="mb-4 inline-flex"
                  >
                    <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl border", isDark ? "border-violet-500/20 bg-violet-500/10" : "border-violet-200 bg-violet-100")}>
                      <Icon size={20} className="text-violet-500" />
                    </span>
                  </motion.div>
                  <h3 className="font-[Outfit] text-base font-bold">{v.title}</h3>
                  <p className={cn("mt-2 text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>{v.desc}</p>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-12">
          <SpotlightCard
            spotlightColor="rgba(139, 92, 246, 0.1)"
            className={cn("rounded-2xl border", glassCard(isDark))}
            innerClassName="p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={cn("flex h-11 w-11 items-center justify-center rounded-xl", isDark ? "bg-violet-500/10" : "bg-violet-100")}
              >
                <Cpu size={20} className="text-violet-500" />
              </motion.div>
              <h2 className="font-[Outfit] text-xl font-bold">Tech Stack</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {stack.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.45 }}
                    whileHover={{ x: 5, scale: 1.015 }}
                    className={cn("flex items-center gap-3 rounded-xl border p-3.5", isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-100 bg-slate-50")}
                  >
                    <motion.span
                      whileHover={{ rotate: 180 }}
                      transition={{ type: "spring", stiffness: 260, damping: 12 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white"
                    >
                      <Icon size={14} />
                    </motion.span>
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold">{s.name}</span>
                      <span className={cn("block truncate text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{s.desc}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </SpotlightCard>
        </Reveal>

        <CTACard
          title="Open Source at Heart"
          subtitle="We believe in building in the open. Check out our code on GitHub and see how Repo Verify is made."
          from="#8b5cf6"
          to="#ec4899"
          icon={<Code2 size={24} />}
          action={
            <Magnetic>
              <motion.a
                href="https://github.com/anomalyco/opencode"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
              >
                <Code2 size={16} /> View on GitHub
              </motion.a>
            </Magnetic>
          }
        />
      </div>

      <BackToTop />
    </motion.main>
  );
}
