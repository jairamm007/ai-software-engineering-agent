import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { GitBranch, Cpu, FileSearch, MessageSquare } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const steps = [
  { icon: GitBranch, step: "01", title: "Connect Repository", description: "Paste your GitHub URL. Our agent clones, parses, and indexes every file in your repository.", gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/30" },
  { icon: Cpu, step: "02", title: "AI Analysis", description: "AI models generate embeddings, map architecture, review code, and build a knowledge base of your project.", gradient: "from-fuchsia-500 to-pink-600", glow: "shadow-fuchsia-500/30" },
  { icon: FileSearch, step: "03", title: "Explore & Discover", description: "Browse dependency graphs, file structures, code reviews, and architecture diagrams — all generated automatically.", gradient: "from-cyan-500 to-blue-600", glow: "shadow-cyan-500/30" },
  { icon: MessageSquare, step: "04", title: "Chat & Act", description: "Ask questions about your code, request changes, generate documentation, and get instant AI-powered answers.", gradient: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30" },
];

function StepCard({ step, index, isDark }: { step: (typeof steps)[number]; index: number; isDark: boolean }) {
  const isLeft = index % 2 === 0;
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -80 : 80, rotateY: isLeft ? -15 : 15 }}
      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`relative flex items-center gap-12 lg:gap-0 ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}
      style={{ perspective: "800px" }}
    >
      <div className={`w-full lg:w-1/2 ${isLeft ? "lg:pr-20 lg:text-right" : "lg:pl-20 lg:text-left"}`}>
        <motion.div whileHover={{ scale: 1.03, rotateY: isLeft ? 3 : -3 }} style={{ transformStyle: "preserve-3d" }}
          className={`inline-block rounded-2xl border p-8 backdrop-blur-sm ${isLeft ? "ml-auto" : ""} ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-md"
          }`}>
          <span className="mb-3 block text-sm font-bold text-slate-500">STEP {step.step}</span>
          <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
          <p className={`text-lg leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{step.description}</p>
        </motion.div>
      </div>
      <div className="absolute left-1/2 z-10 hidden -translate-x-1/2 lg:block">
        <motion.div whileHover={{ scale: 1.3, rotateZ: 90 }} style={{ transformStyle: "preserve-3d" }}
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 shadow-lg ${step.glow} ${
            isDark ? "border-white/20 bg-slate-950" : "border-slate-200 bg-white"
          }`}>
          <Icon size={24} className="text-slate-700" />
        </motion.div>
      </div>
      <div className="hidden w-1/2 lg:block" />
    </motion.div>
  );
}

export default function Workflow() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section id="workflow" className="px-8 py-32" ref={containerRef}>
      <div className="mx-auto max-w-7xl" style={{ perspective: "1200px" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20 text-center">
          <span className={`mb-4 inline-block rounded-full border px-4 py-1.5 text-sm ${
            isDark ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300" : "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700"
          }`}>How It Works</span>
          <h2 className="mt-4 text-5xl font-bold">
            From Repo to <span className="bg-gradient-to-r from-fuchsia-400 to-violet-500 bg-clip-text text-transparent">Insight</span> in Minutes
          </h2>
          <p className={`mx-auto mt-6 max-w-2xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Four simple steps to unlock the full potential of your codebase with AI.
          </p>
        </motion.div>

        <div className="relative">
          <div className={`absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 lg:block ${isDark ? "bg-white/5" : "bg-slate-200"}`}>
            <motion.div className="w-full bg-gradient-to-b from-violet-500/60 via-fuchsia-500/60 to-emerald-500/60" style={{ height: lineHeight }} />
          </div>
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => (
              <StepCard key={step.step} step={step} index={index} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
