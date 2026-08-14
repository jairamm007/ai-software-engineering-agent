import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import Magnetic from "@/components/motion/Magnetic";
import PageHero from "@/components/motion/PageHero";
import ScrollProgress from "@/components/motion/ScrollProgress";
import BackToTop from "@/components/motion/BackToTop";
import CTACard from "@/components/motion/CTACard";
import { glassCard } from "@/components/motion/styles";
import { Link } from "react-router-dom";
import { History, Tag, Plus, Sparkles, Wrench, Shield, Rocket } from "lucide-react";

const releases = [
  {
    version: "v0.4.0",
    date: "June 2026",
    icon: Sparkles,
    color: "text-violet-500 bg-violet-500/10",
    ring: "border-violet-500/25",
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
    ring: "border-fuchsia-500/25",
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
    ring: "border-emerald-500/25",
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
    ring: "border-cyan-500/25",
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("min-h-screen font-[Inter] transition-colors duration-300", isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900")}
    >
      <ScrollProgress className="bg-gradient-to-r from-emerald-500 via-violet-500 to-fuchsia-500" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <PageHero
          icon={History}
          label="Changelog"
          badgeClass={isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-100 text-emerald-700"}
          titleBefore={["What's"]}
          gradientWord="New"
          subtitle="A timeline of features, improvements, and fixes."
          gradientClass="from-emerald-400 via-violet-400 to-fuchsia-400"
          glowClass="rgba(16, 185, 129, 0.12)"
        />

        <div className="relative">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn("absolute left-5 top-0 bottom-0 w-px origin-top", isDark ? "bg-gradient-to-b from-emerald-500/50 via-violet-500/30 to-transparent" : "bg-gradient-to-b from-emerald-400/60 via-violet-300/40 to-transparent")}
          />

          <div className="space-y-10">
            {releases.map((release, ri) => {
              const Icon = release.icon;
              return (
                <Reveal key={release.version} delay={ri * 0.08} x={-18} y={0} className="relative pl-14">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 300, damping: 16 }}
                    whileHover={{ scale: 1.35 }}
                    className={cn("absolute left-3 top-2 flex h-5 w-5 items-center justify-center rounded-full ring-4", isDark ? "bg-slate-900 ring-[#07030F]" : "bg-white ring-white")}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ repeat: Infinity, duration: 2.2, delay: ri * 0.4 }}
                      className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-emerald-400 via-violet-500 to-fuchsia-500"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + ri * 0.1, duration: 0.9, ease: "easeOut" }}
                    className="absolute inset-x-0 top-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-emerald-500 via-violet-500 to-fuchsia-500 opacity-60"
                  />

                  <SpotlightCard
                    spotlightColor={isDark ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.08)"}
                    className={cn("rounded-2xl border transition-shadow duration-300", glassCard(isDark), isDark ? "hover:shadow-xl hover:shadow-emerald-500/10" : "hover:shadow-xl hover:shadow-slate-200/60")}
                    innerClassName="p-6 sm:p-7"
                  >
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.06, rotate: -2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 16 }}
                        className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm font-bold", release.color, release.ring)}
                      >
                        <Icon size={14} /> {release.version}
                      </motion.div>
                      {ri === 0 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 14 }}
                          className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-500"
                        >
                          <Sparkles size={10} /> Latest
                        </motion.span>
                      )}
                      <span className={cn("text-xs font-medium", isDark ? "text-slate-500" : "text-slate-400")}>{release.date}</span>
                      <motion.span
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: ri * 0.3 }}
                        className={cn("ml-auto h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 to-violet-500")}
                      />
                    </div>

                    <ul className="space-y-2.5">
                      {release.changes.map((change, ci) => (
                        <motion.li
                          key={change}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-30px" }}
                          transition={{ delay: 0.15 + ci * 0.07, duration: 0.45 }}
                          whileHover={{ x: 5 }}
                          className={cn("flex items-start gap-2.5 text-sm", isDark ? "text-slate-300" : "text-slate-600")}
                        >
                          <motion.span whileHover={{ scale: 1.3 }} transition={{ type: "spring", stiffness: 400, damping: 12 }}>
                            <Tag size={12} className="mt-1 shrink-0 text-violet-400" />
                          </motion.span>
                          {change}
                        </motion.li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>

        <CTACard
          title="See what's next"
          subtitle="We ship continuously. Create an account to experience the latest features first."
          from="#10b981"
          to="#8b5cf6"
          icon={<Rocket size={24} />}
          action={
            <Magnetic>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
                >
                  Get Started Free
                </Link>
              </motion.div>
            </Magnetic>
          }
        />
      </div>

      <BackToTop />
    </motion.main>
  );
}
