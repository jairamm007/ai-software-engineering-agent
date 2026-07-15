import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import {
  ChevronDown,
  HelpCircle,
  ArrowLeft,
  MessageCircle,
  Shield,
  Cpu,
  Zap,
  CreditCard,
  GitBranch,
  Globe,
  Clock,
} from "lucide-react";

const faqCategories = [
  {
    title: "Getting Started",
    icon: Zap,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    questions: [
      {
        q: "What is Repo Verify?",
        a: "Repo Verify is an AI-powered software engineering agent that analyzes GitHub repositories. It reviews code, generates documentation, maps architecture, detects security vulnerabilities, and lets you chat with your codebase using natural language.",
      },
      {
        q: "How do I get started?",
        a: "Simply sign up for a free account, connect your GitHub account, and paste any repository URL. Our AI agent will clone, parse, and index your entire codebase within 2-5 minutes. Then you can start exploring with AI-powered analysis, chat, and more.",
      },
      {
        q: "Do I need to install anything?",
        a: "No installation required. Repo Verify is a fully web-based platform. Just sign in with your GitHub account and start analyzing repositories directly from your browser.",
      },
    ],
  },
  {
    title: "How It Works",
    icon: Cpu,
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-500/10",
    questions: [
      {
        q: "How does the AI analysis work?",
        a: "When you connect a repository, our agent clones it, indexes every file, generates embeddings, and builds a knowledge base. AI models then analyze the code for patterns, dependencies, potential bugs, and security issues. This entire process typically takes 2-5 minutes depending on repository size.",
      },
      {
        q: "What does the test-fix loop do?",
        a: "The test-fix loop is an automated cycle where Repo Verify identifies issues in your code, generates fixes, runs tests to verify the fix works, and iterates until the code passes all checks. This is especially useful for CI/CD pipelines and maintaining code quality at scale.",
      },
      {
        q: "How accurate is the AI code review?",
        a: "Our AI models achieve 99% accuracy on common code review tasks. They are trained on millions of open-source repositories and continuously updated. However, AI suggestions should always be reviewed by a human developer before merging.",
      },
    ],
  },
  {
    title: "Security & Privacy",
    icon: Shield,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    questions: [
      {
        q: "Is my code and repository data safe?",
        a: "Absolutely. Your code is encrypted in transit (TLS 1.3) and at rest (AES-256). We never share your repository data with third parties. The AI analysis runs in isolated, ephemeral environments, and you can delete your data at any time. We are SOC 2 Type II compliant.",
      },
      {
        q: "Do you store my source code?",
        a: "We store indexed embeddings (mathematical representations) of your code for fast search and analysis, not the raw source code itself. These embeddings cannot be reverse-engineered to reconstruct your original code. You can purge all data at any time from your dashboard.",
      },
      {
        q: "Can I use this for proprietary or enterprise code?",
        a: "Yes. Repo Verify is designed for both open-source and private/proprietary repositories. We support GitHub Enterprise and offer dedicated infrastructure for enterprise customers who require additional isolation and compliance requirements.",
      },
    ],
  },
  {
    title: "Models & Technology",
    icon: GitBranch,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    questions: [
      {
        q: "Which AI models does Repo Verify use?",
        a: "Repo Verify uses a combination of state-of-the-art models including GPT-4, Claude, and specialized code analysis models. We automatically select the best model for each task whether it is code review, documentation generation, architecture analysis, or conversational Q&A.",
      },
      {
        q: "What programming languages are supported?",
        a: "Repo Verify supports all major programming languages including JavaScript, TypeScript, Python, Java, Go, Rust, C++, Ruby, PHP, Swift, Kotlin, and 40+ more. The AI models are trained on diverse codebases across 50+ languages.",
      },
      {
        q: "Does it work with monorepos?",
        a: "Yes! Repo Verify handles monorepos, multi-package repositories, and complex project structures. It understands workspace configurations, shared dependencies, and cross-package relationships automatically.",
      },
    ],
  },
  {
    title: "Pricing & Plans",
    icon: CreditCard,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    questions: [
      {
        q: "Is this free to use?",
        a: "Yes! The free tier includes basic code analysis, architecture mapping, and up to 50 AI chat messages per month. No credit card required to get started. We also offer Pro and Enterprise plans for heavier usage.",
      },
      {
        q: "What is included in the Pro plan?",
        a: "The Pro plan includes unlimited repositories, advanced AI code review, auto-generated documentation, security scanning, priority support, and unlimited AI chat messages. It is designed for professional developers and small teams.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Absolutely. There are no long-term contracts. You can upgrade, downgrade, or cancel your plan at any time from your dashboard. If you cancel, you will retain access until the end of your current billing period.",
      },
    ],
  },
];

export default function FAQPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex((prev) => (prev === key ? null : key));
  };

  return (
    <main className={`min-h-screen font-[Inter] transition-colors duration-300 ${isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900"}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/3 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <Link to="/" className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mb-14 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }} className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${isDark ? "border-violet-500/20 bg-violet-500/10 text-violet-300" : "border-violet-200 bg-violet-100 text-violet-700"}`}>
            <HelpCircle size={14} className="text-violet-400" />
            Help Center
          </motion.div>
          <h1 className="font-[Outfit] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className={`mx-auto mt-5 max-w-xl text-lg font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Everything you need to know about Repo Verify. Can't find what you're looking for?{" "}
            <Link to="/dashboard" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">Contact us</Link>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-14 grid grid-cols-3 gap-4">
          {[{ icon: MessageCircle, label: "Questions Answered", value: "10K+" }, { icon: Clock, label: "Avg Response Time", value: "< 24h" }, { icon: Globe, label: "Help Articles", value: "200+" }].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className={`rounded-xl border p-4 text-center ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"}`}>
              <stat.icon size={18} className={`mx-auto mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
              <div className="font-[Outfit] text-lg font-bold">{stat.value}</div>
              <div className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="space-y-12">
          {faqCategories.map((category, catIndex) => {
            const CatIcon = category.icon;
            return (
              <motion.div key={category.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + catIndex * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${category.bgColor}`}>
                    <CatIcon size={18} className={category.color} />
                  </div>
                  <h2 className={`font-[Outfit] text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{category.title}</h2>
                </div>
                <div className="space-y-3">
                  {category.questions.map((item, qIndex) => {
                    const key = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === key;
                    return (
                      <motion.div key={key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + catIndex * 0.1 + qIndex * 0.05 }}>
                        <button type="button" onClick={() => toggle(key)} className={`w-full text-left rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${isOpen ? isDark ? "border-violet-500/20 bg-violet-500/5 shadow-lg shadow-violet-500/5" : "border-violet-200 bg-violet-50 shadow-md" : isDark ? "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"}`}>
                          <div className="flex items-start justify-between gap-4">
                            <h3 className={`font-[Outfit] text-base font-semibold sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>{item.q}</h3>
                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="mt-1 shrink-0">
                              <ChevronDown size={18} className={`transition-colors ${isOpen ? "text-violet-400" : isDark ? "text-slate-500" : "text-slate-400"}`} />
                            </motion.div>
                          </div>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                                <p className={`mt-4 text-sm leading-relaxed font-[Inter] border-t pt-4 ${isDark ? "text-slate-400 border-white/[0.06]" : "text-slate-500 border-slate-200"}`}>{item.a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className={`mt-16 rounded-2xl border p-8 text-center ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"}`}>
          <h3 className="font-[Outfit] text-xl font-bold mb-2">Still have questions?</h3>
          <p className={`text-sm font-[Inter] mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Our team is here to help you get the most out of Repo Verify.</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.03]">
            Get Started Free
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
