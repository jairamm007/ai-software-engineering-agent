import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { useTheme } from "@/context/ThemeContext";
import {
  CheckCircle2,
  ChevronRight,
  FileCode2,
  Folder,
  Sparkles,
} from "lucide-react";
const Github = ({ size = 15, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const code = `import { analyzeRepository } from "@/repo-verify";

const result = await analyzeRepository({
  repo: "github.com/user/project",
  deep: true,
});

console.log(result.insights);`;

const files = [
  { name: "src", folder: true },
  { name: "components", folder: true },
  { name: "utils", folder: true },
  { name: "repo-verify.ts", folder: false },
  { name: "index.ts", folder: false },
];

const actions = ["Explain", "Review", "Docs", "Tests", "Security"];
const terminalItems = [
  "Repository Indexed",
  "Embeddings Generated",
  "AI Review Completed",
  "Documentation Ready",
];

export default function AnimatedIDE() {
  const [typedLength, setTypedLength] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTypedLength((previous) => (previous >= code.length ? 0 : previous + 1));
    }, 24);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[720px] py-10">
      {/* Background glows */}
      <div className={`absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px] ${isDark ? "bg-purple-700/30" : "bg-purple-400/15"}`} />
      <div className={`absolute right-0 top-10 h-48 w-48 rounded-full blur-[130px] ${isDark ? "bg-pink-600/20" : "bg-pink-300/15"}`} />
      <div className={`absolute bottom-8 left-0 h-44 w-44 rounded-full blur-[120px] ${isDark ? "bg-cyan-500/20" : "bg-cyan-300/15"}`} />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <Tilt
          glareEnable
          glareMaxOpacity={isDark ? 0.18 : 0.1}
          glareColor={isDark ? "#c084fc" : "#8b5cf6"}
          tiltMaxAngleX={8}
          tiltMaxAngleY={8}
          perspective={1200}
          className="rounded-3xl"
        >
          {/* ─── Outer shell ─── */}
          <div className={`overflow-hidden rounded-3xl ${
            isDark
              ? "border border-white/10 bg-white/5 shadow-[0_0_80px_rgba(139,92,246,0.08)]"
              : "border border-slate-200/80 bg-slate-50 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12),0_2px_12px_-2px_rgba(0,0,0,0.06)]"
          }`}>
            {/* ─── Title bar ─── */}
            <div className={`flex h-11 items-center px-4 ${
              isDark
                ? "border-b border-white/10 bg-slate-950/70"
                : "border-b border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50"
            }`}>
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400 ring-1 ring-red-400/20" />
                <div className="h-3 w-3 rounded-full bg-yellow-400 ring-1 ring-yellow-400/20" />
                <div className="h-3 w-3 rounded-full bg-green-400 ring-1 ring-green-400/20" />
              </div>
              <div className={`ml-4 flex flex-1 items-center gap-2 text-[13px] font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <FileCode2 size={14} className="text-violet-500" />
                repo-verify.ts
              </div>
              <div className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <Github size={13} /> GitHub
              </div>
            </div>

            {/* ─── Main grid ─── */}
            <div className="grid min-h-[380px] grid-cols-[0.85fr_1.45fr_0.9fr]">

              {/* ─── File tree ─── */}
              <motion.aside
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className={`p-3.5 ${
                  isDark
                    ? "border-r border-white/[0.06] bg-slate-950/50"
                    : "border-r border-slate-200/80 bg-white"
                }`}
              >
                <p className={`mb-3 text-[10px] font-semibold tracking-widest uppercase ${isDark ? "text-slate-600" : "text-slate-400"}`}>Repository</p>
                <div className="space-y-0.5 text-[13px]">
                  {files.map((file) => (
                    <motion.div
                      key={file.name}
                      whileHover={{ x: 4, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(139,92,246,0.06)" }}
                      className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {file.folder ? (
                        <motion.span whileHover={{ rotate: 8 }}>
                          <Folder size={15} className="text-violet-500" />
                        </motion.span>
                      ) : (
                        <FileCode2 size={15} className="text-cyan-500" />
                      )}
                      {file.folder && <ChevronRight size={13} className={isDark ? "text-slate-600" : "text-slate-300"} />}
                      <span className={file.folder ? (isDark ? "text-slate-200" : "text-slate-700 font-medium") : (isDark ? "text-slate-400" : "text-slate-500")}>
                        {file.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.aside>

              {/* ─── Code editor (always dark) ─── */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="min-w-0 bg-[#0c101c] p-4"
              >
                <div className="mb-3 flex items-center gap-2 border-b border-white/[0.06] pb-2.5 text-[13px]">
                  <FileCode2 size={13} className="text-cyan-400" />
                  <span className="text-slate-300">repo-verify.ts</span>
                  <span className="ml-auto text-[11px] text-slate-500">TypeScript</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-end text-[11px] leading-6 text-slate-600 select-none">
                    {code.substring(0, typedLength).split("\n").map((_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>
                  <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-slate-300">
                    {code.substring(0, typedLength)}
                    <motion.span
                      animate={{ opacity: [1, 0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-violet-400"
                    >
                      |
                    </motion.span>
                  </pre>
                </div>
              </motion.div>

              {/* ─── AI panel ─── */}
              <motion.aside
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className={`p-3.5 ${
                  isDark
                    ? "border-l border-white/[0.06] bg-slate-950/50"
                    : "border-l border-slate-200/80 bg-white"
                }`}
              >
                <div className={`mb-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <Sparkles size={13} className="text-fuchsia-500" /> AI Assistant
                </div>
                <div className="space-y-1.5">
                  {actions.map((action, index) => (
                    <motion.button
                      key={action}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 16px rgba(168,85,247,0.3)" }}
                      className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-[7px] text-left text-xs font-medium transition-colors ${
                        isDark
                          ? "border-violet-400/15 bg-violet-500/[0.08] text-violet-200 hover:bg-violet-500/15"
                          : "border-violet-200/80 bg-violet-50 text-violet-600 hover:bg-violet-100"
                      }`}
                    >
                      <CheckCircle2 size={13} className={isDark ? "text-violet-400" : "text-violet-500"} /> {action}
                    </motion.button>
                  ))}
                </div>
                <div className={`mt-3 rounded-lg p-2.5 ${
                  isDark
                    ? "border border-white/[0.06] bg-white/[0.04]"
                    : "border border-slate-200/80 bg-slate-50"
                }`}>
                  <p className={`mb-1 text-[11px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>AI Suggestion</p>
                  <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Repository structure looks clean. Consider adding error handling in{" "}
                    <span className="text-cyan-500 font-medium">repo-verify.ts</span>.
                  </p>
                </div>
              </motion.aside>
            </div>

            {/* ─── Status bar ─── */}
            <div className={`grid grid-cols-3 items-center px-4 py-2 text-[12px] ${
              isDark
                ? "border-t border-white/[0.06] bg-slate-950/60 text-slate-400"
                : "border-t border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 text-slate-500"
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
                Repository Indexed
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles size={12} className="text-violet-500" />
                <span className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-500"}`}>98%</span> Health
              </div>
              <div className="text-right"><Counter end={420} duration={2.5} /> Files Analyzed</div>
            </div>

            {/* ─── Terminal bar ─── */}
            <div className={`flex flex-wrap gap-x-4 gap-y-1.5 border-t px-4 py-2 text-[12px] ${
              isDark
                ? "border-white/[0.06] bg-[#0a0e1a] text-slate-500"
                : "border-slate-200/80 bg-slate-100/80 text-slate-400"
            }`}>
              {terminalItems.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.4 }}
                  className="flex items-center gap-1"
                >
                  <CheckCircle2 size={12} className="text-emerald-500" /> {item}
                </motion.div>
              ))}
            </div>
          </div>
        </Tilt>
      </motion.div>

      {/* ─── Floating cards ─── */}
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
        <FloatingCard duration={4} isDark={isDark}>
          ✓ Repository Indexed
        </FloatingCard>
        <FloatingCard duration={5} isDark={isDark}>
          98% AI Health
        </FloatingCard>
        <FloatingCard duration={4.5} isDark={isDark}>
          <Counter end={420} duration={2.5} /> Files
        </FloatingCard>
        <FloatingCard duration={6} isDark={isDark}>
          Architecture Generated
        </FloatingCard>
      </div>
    </div>
  );
}

function Counter({ end, duration }: { end: number; duration: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = (Date.now() - start) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}</span>;
}

function FloatingCard({
  children,
  duration,
  isDark,
}: {
  children: React.ReactNode;
  duration: number;
  isDark: boolean;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
      className={`rounded-xl border px-3.5 py-2 text-xs font-medium backdrop-blur-xl ${
        isDark
          ? "border-white/[0.08] bg-slate-900/80 text-slate-300 shadow-lg shadow-black/20"
          : "border-slate-200/80 bg-white/80 text-slate-600 shadow-md shadow-slate-200/60"
      }`}
    >
      {children}
    </motion.div>
  );
}
