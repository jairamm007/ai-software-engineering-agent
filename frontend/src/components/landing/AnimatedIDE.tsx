import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
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

const code = `import { analyzeRepository } from "@/ai";

const score = await analyzeRepository(repo);

export function shipFaster() {
  return score.insights;
}`;

const files = [
  { name: "src", folder: true },
  { name: "app", folder: true },
  { name: "utils", folder: true },
  { name: "main.ts", folder: false },
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

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTypedLength((previous) => (previous >= code.length ? 0 : previous + 1));
    }, 24);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[720px] py-10">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/30 blur-[180px]" />
      <div className="absolute right-0 top-10 h-48 w-48 rounded-full bg-pink-600/20 blur-[130px]" />
      <div className="absolute bottom-8 left-0 h-44 w-44 rounded-full bg-cyan-500/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <Tilt
          glareEnable
          glareMaxOpacity={0.18}
          glareColor="#c084fc"
          tiltMaxAngleX={8}
          tiltMaxAngleY={8}
          perspective={1200}
          className="rounded-3xl"
        >
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            {/* Title bar */}
            <div className="flex h-12 items-center border-b border-white/10 bg-slate-950/70 px-5">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="ml-5 flex flex-1 items-center gap-2 text-sm font-medium text-slate-200">
                <FileCode2 size={16} className="text-violet-400" />
                Smart-Coin-Optimizer
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Github size={15} /> GitHub
              </div>
            </div>

            {/* Main content */}
            <div className="grid min-h-[390px] grid-cols-[0.85fr_1.45fr_0.9fr]">
              {/* File tree */}
              <motion.aside
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="border-r border-white/10 bg-slate-950/50 p-4"
              >
                <p className="mb-4 text-sm font-semibold tracking-wider text-slate-500">REPOSITORY</p>
                <div className="space-y-2 text-sm text-slate-300">
                  {files.map((file) => (
                    <motion.div
                      key={file.name}
                      whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.08)" }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                    >
                      {file.folder ? (
                        <motion.span whileHover={{ rotate: 8 }}>
                          <Folder size={16} className="text-violet-400" />
                        </motion.span>
                      ) : (
                        <FileCode2 size={16} className="text-cyan-400" />
                      )}
                      {file.folder && <ChevronRight size={14} className="text-slate-500" />}
                      {file.name}
                    </motion.div>
                  ))}
                </div>
              </motion.aside>

              {/* Code editor */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="min-w-0 bg-[#080B18] p-5"
              >
                <div className="mb-4 border-b border-white/10 pb-3 text-sm text-slate-400">code.ts</div>
                <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7 text-slate-300">
                  {code.substring(0, typedLength)}
                  <motion.span
                    animate={{ opacity: [1, 0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-violet-300"
                  >
                    |
                  </motion.span>
                </pre>
              </motion.div>

              {/* AI panel */}
              <motion.aside
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="border-l border-white/10 bg-slate-950/50 p-4"
              >
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-400">
                  <Sparkles size={15} className="text-fuchsia-400" /> AI ASSISTANT
                </div>
                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <motion.button
                      key={action}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(168, 85, 247, 0.45)" }}
                      className="flex w-full items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-left text-sm text-violet-100"
                    >
                      <CheckCircle2 size={15} className="text-violet-300" /> {action}
                    </motion.button>
                  ))}
                </div>
              </motion.aside>
            </div>

            {/* Status bar */}
            <div className="grid grid-cols-3 border-t border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-slate-300">
              <div>Repository Indexed</div>
              <div className="text-center"><span className="text-emerald-400">98%</span> Health</div>
              <div className="text-right"><Counter end={420} duration={2.5} /> Files</div>
            </div>

            {/* Terminal bar */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 bg-black/20 px-5 py-3 text-sm text-slate-400">
              {terminalItems.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.4 }}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} className="text-emerald-400" /> {item}
                </motion.div>
              ))}
            </div>
          </div>
        </Tilt>
      </motion.div>

      {/* Floating cards — positioned around the edges */}
      <FloatingCard className="-right-3 top-2" duration={4}>
        ✓ Repository Indexed
      </FloatingCard>
      <FloatingCard className="-left-4 bottom-1/4" duration={5}>
        98% AI Health
      </FloatingCard>
      <FloatingCard className="-right-2 bottom-0" duration={4.5}>
        <Counter end={420} duration={2.5} /> Files
      </FloatingCard>
      <FloatingCard className="-left-3 top-1/2 -translate-y-1/2" duration={6}>
        Architecture Generated
      </FloatingCard>
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
  className,
  duration,
}: {
  children: React.ReactNode;
  className: string;
  duration: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration }}
      className={`absolute rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}
