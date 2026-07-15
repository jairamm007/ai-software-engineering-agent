import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Rss, Calendar, Tag, Clock, ArrowRight } from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 18 } },
};

const posts = [
  {
    date: "June 28, 2026",
    tag: "Engineering",
    tagColor: "text-violet-500 bg-violet-500/10",
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

export default function BlogPage() {
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-fuchsia-600/5 rounded-full blur-[150px]" />
        <motion.div
          animate={{ y: [0, -25, 0], x: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute top-32 left-[12%] h-56 w-56 rounded-full bg-fuchsia-500/[0.04] blur-[90px]"
        />
        <motion.div
          animate={{ y: [0, 18, 0], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute bottom-24 right-[18%] h-40 w-40 rounded-full bg-violet-500/[0.04] blur-[70px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <motion.div variants={itemVariants} className="mb-10">
          <Link to="/" className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-14 text-center">
          <motion.div variants={badgeVariants} className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${isDark ? "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300" : "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700"}`}>
            <Rss size={14} className="text-fuchsia-400" /> Blog
          </motion.div>
          <h1 className="font-[Outfit] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Dev Logs &{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-pink-400 bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]">Updates</span>
          </h1>
          <p className={`mx-auto mt-5 max-w-xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Insights from the team building the future of AI-powered code analysis.
          </p>
        </motion.div>

        <motion.div variants={pageVariants} className="space-y-8">
          {posts.map((post) => (
            <motion.article
              key={post.title}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`group rounded-2xl border p-6 sm:p-8 transition-shadow duration-300 ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-xl hover:shadow-fuchsia-500/5" : "border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/60"}`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <motion.span
                  whileHover={{ scale: 1.08 }}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${post.tagColor}`}
                >
                  <Tag size={10} /> {post.tag}
                </motion.span>
                <span className={`flex items-center gap-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <Calendar size={11} /> {post.date}
                </span>
                <span className={`flex items-center gap-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <Clock size={11} /> {post.readTime}
                </span>
              </div>
              <h2 className={`font-[Outfit] text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>{post.title}</h2>
              <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{post.excerpt}</p>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`rounded-xl border p-5 text-sm leading-relaxed whitespace-pre-line ${isDark ? "border-white/[0.04] bg-white/[0.02] text-slate-400" : "border-slate-100 bg-slate-50 text-slate-500"}`}
              >
                {post.content}
              </motion.div>
              <motion.div
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-violet-500 hover:text-violet-400 transition-colors cursor-pointer"
              >
                Read full post <ArrowRight size={14} />
              </motion.div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </motion.main>
  );
}
