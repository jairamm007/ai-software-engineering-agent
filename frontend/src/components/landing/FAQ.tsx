import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is Repo Verify?",
    answer: "Repo Verify is an AI-powered software engineering agent that analyzes GitHub repositories. It reviews code, generates documentation, maps architecture, detects security vulnerabilities, and lets you chat with your codebase using natural language.",
  },
  {
    question: "How does the AI analysis work?",
    answer: "When you connect a repository, our agent clones it, indexes every file, generates embeddings, and builds a knowledge base. AI models then analyze the code for patterns, dependencies, potential bugs, and security issues. This entire process typically takes 2-5 minutes depending on repository size.",
  },
  {
    question: "Is my code secure and private?",
    answer: "Absolutely. Your code is encrypted in transit and at rest. We never share your repository data with third parties. The AI analysis runs in isolated environments, and you can delete your data at any time. We are SOC 2 Type II compliant.",
  },
  {
    question: "What programming languages are supported?",
    answer: "Repo Verify supports all major programming languages including JavaScript, TypeScript, Python, Java, Go, Rust, C++, Ruby, PHP, Swift, Kotlin, and many more. The AI models are trained on diverse codebases across 50+ languages.",
  },
  {
    question: "Can I use Repo Verify for private repositories?",
    answer: "Yes! Repo Verify works with both public and private GitHub repositories. We use GitHub's official API with read-only permissions. We never push changes to your repository without explicit consent.",
  },
  {
    question: "What's included in the free tier?",
    answer: "The free tier includes basic code analysis, architecture mapping, and up to 50 AI chat messages per month. No credit card required to get started.",
  },
  {
    question: "How is this different from GitHub Copilot?",
    answer: "GitHub Copilot focuses on code completion within your editor. Repo Verify operates at the repository level — it analyzes entire codebases, generates documentation, maps architecture, reviews pull requests, and lets you chat about your code in natural language. They complement each other perfectly.",
  },
];

function FAQItem({ faq, index, isDark }: { faq: (typeof faqs)[number]; index: number; isDark: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full text-left rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
          open
            ? isDark
              ? "border-violet-500/20 bg-violet-500/5"
              : "border-violet-200 bg-violet-50"
            : isDark
              ? "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className={`font-[Outfit] text-base font-semibold sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
            {faq.question}
          </h3>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1 shrink-0"
          >
            <ChevronDown size={18} className={`${isDark ? "text-slate-400" : "text-slate-500"}`} />
          </motion.div>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className={`mt-4 text-sm leading-relaxed font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {faq.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

export default function FAQ() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32">
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
            className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
              isDark ? "border-blue-500/20 bg-blue-500/10 text-blue-300" : "border-blue-200 bg-blue-100 text-blue-700"
            }`}
          >
            <HelpCircle size={14} className="text-blue-400" />
            FAQ
          </motion.span>
          <h2 className="mt-5 font-[Outfit] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className={`mx-auto mt-6 max-w-xl text-lg font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Everything you need to know about Repo Verify.
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem key={faq.question} faq={faq} index={index} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  );
}
