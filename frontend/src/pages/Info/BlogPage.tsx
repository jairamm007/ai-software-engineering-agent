import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import PlexusTerrainBackground from "@/components/landing/PlexusTerrainBackground";
import GradientOrbs from "@/components/motion/GradientOrbs";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import PageHero from "@/components/motion/PageHero";
import ScrollProgress from "@/components/motion/ScrollProgress";
import BackToTop from "@/components/motion/BackToTop";
import CTACard from "@/components/motion/CTACard";
import Magnetic from "@/components/motion/Magnetic";
import { glassCard } from "@/components/motion/styles";
import { Rss, Calendar, Tag, Clock, ArrowRight, Newspaper, Link2 } from "lucide-react";

const posts = [
  {
    date: "June 28, 2026",
    tag: "Engineering",
    tagColor: "text-violet-500 bg-violet-500/10",
    chipBorder: "border-violet-500/25",
    title: "Building a Test-Fix Loop with LLM-Powered Agents",
    excerpt: "How we implemented an autonomous cycle where our AI agent identifies bugs, generates patches, runs tests, and iterates — all without human intervention.",
    readTime: "8 min read",
    content: `The test-fix loop is one of Repo Verify's most powerful features. When the AI agent identifies an issue during code review, it doesn't just report it — it fixes it.

Here's how the pipeline works:
• **Detection**: The agent scans for bugs, security issues, and anti-patterns.
• **Generation**: It proposes a targeted code patch.
• **Validation**: Tests run automatically against the patch.
• **Iteration**: If tests fail, the agent revises and retries (up to 5 cycles).

We built this using a combination of LangChain chains and custom tool-calling agents. The key insight was limiting the agent's scope per iteration — rather than rewriting entire files, each cycle makes surgical, reviewable changes.`,
  },
  {
    date: "May 12, 2026",
    tag: "Product",
    tagColor: "text-fuchsia-500 bg-fuchsia-500/10",
    chipBorder: "border-fuchsia-500/25",
    title: "How We Index 50,000 Files in Under 3 Minutes",
    excerpt: "A deep dive into our parallelized indexing pipeline that parses, chunks, embeds, and stores entire repositories at remarkable speed.",
    readTime: "6 min read",
    content: `Indexing a large repository is the most resource-intensive part of Repo Verify. Our goal was to make it fast without sacrificing quality.

We achieved this through three optimizations:
• **Parallel chunking**: Files are processed concurrently using worker threads, with intelligent batching based on file size.
• **Incremental embeddings**: Only new or changed files get re-embedded on re-analysis, cutting repeat indexing time by 80%.
• **Streaming storage**: Chunks are written to the database as they're generated, rather than batched at the end.

The result: a 50,000-file monorepo indexes in under 3 minutes on our infrastructure.`,
  },
  {
    date: "April 3, 2026",
    tag: "Launch",
    tagColor: "text-emerald-500 bg-emerald-500/10",
    chipBorder: "border-emerald-500/25",
    title: "Introducing Repo Verify: AI-Powered Repository Intelligence",
    excerpt: "Today we're launching Repo Verify — an AI agent that reads your entire codebase and helps you understand, review, and document it.",
    readTime: "4 min read",
    content: `We built Repo Verify because we were tired of spending hours reading through unfamiliar codebases. Every developer knows the feeling: joining a new project, opening the repo, and seeing thousands of files with no clear entry point.

Repo Verify changes that. Paste a GitHub URL, and our AI agent:
• Maps the full architecture and dependency graph
• Reviews code for bugs, security issues, and style violations
• Generates comprehensive documentation automatically
• Lets you ask questions about the code in natural language

We're launching with support for 50+ programming languages and all major frameworks. Sign up free — no credit card required.`,
  },
];

const tagFilters = ["All", "Engineering", "Product", "Launch"];

export default function BlogPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTag, setActiveTag] = useState("All");

  const filtered = activeTag === "All" ? posts : posts.filter((p) => p.tag === activeTag);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("min-h-screen font-[Inter] transition-colors duration-300", isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900")}
    >
      <PlexusTerrainBackground />
      <GradientOrbs className="[&>*]:opacity-90" />
      <ScrollProgress className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-pink-500" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <PageHero
          icon={Rss}
          label="Blog"
          badgeClass={isDark ? "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300" : "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700"}
          titleBefore={["Dev", "Logs", "&"]}
          gradientWord="Updates"
          subtitle="Insights from the team building the future of AI-powered code analysis."
          gradientClass="from-fuchsia-400 via-violet-400 to-pink-400"
          glowClass="rgba(217, 70, 239, 0.12)"
        />

        <Reveal className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
          {tagFilters.map((tag) => (
            <motion.button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              animate={activeTag === tag ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300",
                activeTag === tag
                  ? isDark
                    ? "border-violet-500/40 bg-violet-500/15 text-violet-200 shadow-lg shadow-violet-500/10"
                    : "border-violet-300 bg-violet-100 text-violet-800 shadow-md"
                  : isDark
                    ? "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/15 hover:text-white"
                    : "border-slate-200/70 bg-white/60 text-slate-500 hover:border-slate-300 hover:text-slate-900"
              )}
            >
              {tag}
            </motion.button>
          ))}
        </Reveal>

        <motion.div layout className="space-y-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((post) => (
              <motion.article
                key={post.title}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <SpotlightCard
                  spotlightColor={isDark ? "rgba(217, 70, 239, 0.12)" : "rgba(217, 70, 239, 0.1)"}
                  className={cn("rounded-2xl border transition-all duration-300", glassCard(isDark), "hover:-translate-y-1")}
                  innerClassName="p-6 sm:p-8"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="absolute inset-x-6 top-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-pink-500"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <motion.span
                      whileHover={{ scale: 1.08 }}
                      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", post.tagColor, post.chipBorder)}
                    >
                      <Tag size={10} /> {post.tag}
                    </motion.span>
                    <span className={cn("flex items-center gap-1 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                      <Calendar size={11} /> {post.date}
                    </span>
                    <span className={cn("flex items-center gap-1 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                      <Clock size={11} /> {post.readTime}
                    </span>
                  </div>

                  <motion.h2
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="mt-4 font-[Outfit] text-xl font-bold sm:text-2xl"
                  >
                    {post.title}
                  </motion.h2>

                  <p className={cn("mt-2 text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>{post.excerpt}</p>

                  <div
                    className={cn(
                      "mt-5 rounded-xl border p-5 text-sm leading-relaxed whitespace-pre-line",
                      isDark ? "border-white/[0.06] bg-[#0a0614]/60 text-slate-400" : "border-slate-200/70 bg-slate-50 text-slate-500"
                    )}
                  >
                    {post.content}
                  </div>

                  <motion.div
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="mt-5 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-fuchsia-500 transition-colors hover:text-fuchsia-400"
                  >
                    Read full post <ArrowRight size={14} />
                  </motion.div>
                </SpotlightCard>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        <CTACard
          title="Never miss an update"
          subtitle="Follow the engineering journey behind Repo Verify — new posts land here regularly."
          from="#d946ef"
          to="#8b5cf6"
          icon={<Newspaper size={24} />}
          action={
            <Magnetic>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <a
                  href="https://github.com/anomalyco/opencode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-shadow hover:shadow-xl hover:shadow-fuchsia-500/40"
                >
                  <Link2 size={16} /> Follow on GitHub
                </a>
              </motion.div>
            </Magnetic>
          }
        />
      </div>

      <BackToTop />
    </motion.main>
  );
}
