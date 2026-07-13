import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Code2, FileSearch, GitBranch, MessageSquare, Shield, BookOpen } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { ReactNode } from "react";

const features = [
  { icon: Code2, title: "AI Code Review", description: "Automated code review powered by AI that catches bugs, suggests improvements, and enforces best practices across your codebase.", gradient: "from-violet-500 to-purple-600" },
  { icon: FileSearch, title: "Smart Analysis", description: "Deep repository analysis that understands your code structure, dependencies, and patterns to provide contextual insights.", gradient: "from-fuchsia-500 to-pink-600" },
  { icon: GitBranch, title: "Architecture Mapping", description: "Visualize your repository architecture with automatic dependency graphs and module relationship mapping.", gradient: "from-cyan-500 to-blue-600" },
  { icon: MessageSquare, title: "AI Chat Assistant", description: "Chat with your repository. Ask questions about code, get explanations, and receive guided walkthroughs powered by AI.", gradient: "from-emerald-500 to-teal-600" },
  { icon: BookOpen, title: "Auto Documentation", description: "Generate comprehensive documentation for your entire codebase including API references, module docs, and usage guides.", gradient: "from-orange-500 to-red-600" },
  { icon: Shield, title: "Security Scanning", description: "Identify vulnerabilities, exposed secrets, and security anti-patterns before they make it to production.", gradient: "from-amber-500 to-yellow-600" },
];

function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);
  const glareOpacity = useTransform(mouseXSpring, [-0.5, 0, 0.5], [0, 0.15, 0]);

  return (
    <motion.div
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width - 0.5); y.set((e.clientY - r.top) / r.height - 0.5); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative ${className ?? ""}`}
    >
      <motion.div className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
        style={{ background: useTransform([glareX, glareY], ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.8), transparent 60%)`), opacity: glareOpacity }} />
      <div style={{ transformStyle: "preserve-3d" }}>{children}</div>
    </motion.div>
  );
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -10 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Features() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section id="features" className="px-8 py-32">
      <div className="mx-auto max-w-7xl" style={{ perspective: "1200px" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
          <span className={`mb-4 inline-block rounded-full border px-4 py-1.5 text-sm ${
            isDark ? "border-violet-500/30 bg-violet-500/10 text-violet-300" : "border-violet-200 bg-violet-100 text-violet-700"
          }`}>Powerful Features</span>
          <h2 className="mt-4 text-5xl font-bold">
            Everything You Need to <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">Ship Faster</span>
          </h2>
          <p className={`mx-auto mt-6 max-w-2xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            A complete AI-powered toolkit for understanding, reviewing, and improving your software repositories.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" style={{ transformStyle: "preserve-3d" }}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={cardVariants}>
                <TiltCard className="h-full">
                  <div className={`group h-full rounded-2xl border p-8 backdrop-blur-sm transition-colors ${
                    isDark ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
                  }`}>
                    <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg`} style={{ transform: "translateZ(20px)" }}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold" style={{ transform: "translateZ(15px)" }}>{feature.title}</h3>
                    <p className={`leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`} style={{ transform: "translateZ(10px)" }}>
                      {feature.description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
