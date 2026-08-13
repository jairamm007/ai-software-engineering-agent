import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import PlexusTerrainBackground from "@/components/landing/PlexusTerrainBackground";
import GradientOrbs from "@/components/motion/GradientOrbs";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import Magnetic from "@/components/motion/Magnetic";
import PageHero from "@/components/motion/PageHero";
import ScrollProgress from "@/components/motion/ScrollProgress";
import BackToTop from "@/components/motion/BackToTop";
import CTACard from "@/components/motion/CTACard";
import { glassCard } from "@/components/motion/styles";
import { Link } from "react-router-dom";
import { BookOpen, Terminal, Code2, Settings, Zap, ExternalLink, CornerDownRight } from "lucide-react";

const sections = [
  {
    icon: Zap,
    title: "Quick Start",
    accent: "text-violet-500",
    content: "Get up and running in under 2 minutes. No installation required — Repo Verify runs entirely in your browser.",
    steps: [
      { label: "Sign Up", desc: "Create a free account at repo-verify.dev or sign in with GitHub/Google." },
      { label: "Connect a Repository", desc: "Paste any public or private GitHub repository URL into the dashboard." },
      { label: "Wait for Indexing", desc: "Our AI agent clones, parses, and indexes your entire codebase (2–5 min)." },
      { label: "Explore", desc: "Use the AI Chat, Code Review, Architecture Map, and Documentation tabs." },
    ],
  },
  {
    icon: Terminal,
    title: "Configuration",
    accent: "text-fuchsia-500",
    content: "Repo Verify works out of the box with zero configuration. For advanced use cases, customize via the Settings panel.",
    code: `// repo-verify.config.ts (optional)
export default {
  ai: {
    model: "gpt-4o",        // or "claude-3.5-sonnet"
    temperature: 0.3,
    maxTokens: 4096,
  },
  analysis: {
    depth: "deep",           // "quick" | "deep"
    languages: ["typescript", "python"],
    includeTests: false,
  },
  documentation: {
    format: "markdown",      // "markdown" | "html"
    sections: ["overview", "api", "architecture"],
  },
};`,
  },
  {
    icon: Code2,
    title: "API Reference",
    accent: "text-cyan-500",
    content: "Use the REST API to integrate Repo Verify into your CI/CD pipeline or custom tooling.",
    code: `// Analyze a repository
POST /api/repository/analyze
{
  "url": "github.com/user/repo",
  "deep": true
}

// Chat with your codebase
POST /api/chat/stream
{
  "message": "Explain the auth module",
  "repositoryId": "repo_abc123",
  "conversationId": "conv_xyz789"   // optional
}

// Get analysis results
GET /api/repository/:id/overview
GET /api/repository/:id/files
GET /api/repository/:id/review`,
  },
  {
    icon: Settings,
    title: "Supported Platforms",
    accent: "text-emerald-500",
    content: "Repo Verify currently supports GitHub repositories. GitLab and Bitbucket support is on our roadmap for Q3 2026.",
    items: [
      "GitHub Public Repositories",
      "GitHub Private Repositories (OAuth)",
      "GitHub Enterprise (SSO)",
      "GitLab (coming soon)",
      "Bitbucket (coming soon)",
    ],
  },
];

export default function DocsPage() {
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
          icon={BookOpen}
          label="Documentation"
          badgeClass={isDark ? "border-violet-500/20 bg-violet-500/10 text-violet-300" : "border-violet-200 bg-violet-100 text-violet-700"}
          titleBefore={["Build", "with"]}
          gradientWord="Repo"
          gradientWords={["Repo", "Verify"]}
          titleAfter={["Verify"]}
          subtitle="Everything you need to analyze, review, and document your codebase with AI."
          gradientClass="from-violet-400 via-fuchsia-400 to-pink-400"
          glowClass="rgba(139, 92, 246, 0.14)"
        />

        <div className="space-y-10">
          {sections.map((section, si) => {
            const Icon = section.icon;
            return (
              <Reveal key={section.title} delay={si * 0.05} y={34}>
                <SpotlightCard
                  spotlightColor={isDark ? "rgba(139, 92, 246, 0.11)" : "rgba(139, 92, 246, 0.08)"}
                  className={cn("rounded-2xl border transition-shadow duration-300", glassCard(isDark), isDark ? "hover:shadow-xl hover:shadow-violet-500/10" : "hover:shadow-xl hover:shadow-slate-200/60")}
                  innerClassName="p-6 sm:p-8"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
                    className="absolute inset-x-6 top-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
                  />

                  <div className="mb-4 flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 14 }}
                      className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", isDark ? "border-violet-500/20 bg-violet-500/10" : "border-violet-200 bg-violet-100")}
                    >
                      <Icon size={20} className={section.accent} />
                    </motion.div>
                    <h2 className="font-[Outfit] text-xl font-bold">{section.title}</h2>
                  </div>
                  <p className={cn("mb-5 text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>{section.content}</p>

                  {section.steps && (
                    <div className="space-y-3">
                      {section.steps.map((step, i) => (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: -14 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-30px" }}
                          transition={{ delay: 0.1 + i * 0.08, duration: 0.45 }}
                          whileHover={{ x: 5, scale: 1.01 }}
                          className={cn("flex gap-4 rounded-xl border p-4", isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200/70 bg-white/50")}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 8 }}
                            transition={{ type: "spring", stiffness: 400, damping: 12 }}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white shadow-md shadow-violet-500/20"
                          >
                            {i + 1}
                          </motion.div>
                          <div>
                            <p className="text-sm font-semibold">{step.label}</p>
                            <p className={cn("mt-0.5 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{step.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {section.code && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                      whileHover={{ boxShadow: "0 0 40px -8px rgba(139, 92, 246, 0.25)" }}
                      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c101c]"
                    >
                      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                        <span className="ml-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <Terminal size={11} /> repo-verify
                        </span>
                      </div>
                      <pre className="overflow-x-auto p-5 text-[13px] leading-6 text-slate-300">
                        <code>{section.code}</code>
                      </pre>
                      <motion.div
                        initial={{ x: "-100%" }}
                        whileInView={{ x: "100%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
                        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
                      />
                    </motion.div>
                  )}

                  {section.items && (
                    <ul className="space-y-2.5">
                      {section.items.map((item, i) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -14 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-30px" }}
                          transition={{ delay: 0.08 + i * 0.07, duration: 0.45 }}
                          whileHover={{ x: 5 }}
                          className={cn("flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm", isDark ? "border-white/[0.05] bg-white/[0.02] text-slate-300" : "border-slate-100 bg-slate-50 text-slate-600")}
                        >
                          <motion.span
                            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                            className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"
                          />
                          <CornerDownRight size={12} className={cn("shrink-0", isDark ? "text-slate-600" : "text-slate-400")} />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>

        <CTACard
          title="Ready to get started?"
          subtitle="Analyze your first repository in under 2 minutes."
          from="#8b5cf6"
          to="#ec4899"
          icon={<BookOpen size={24} />}
          action={
            <Magnetic>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
                >
                  Get Started Free <ExternalLink size={14} />
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
