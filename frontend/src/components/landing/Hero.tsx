import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import AnimatedIDE from "@/components/landing/AnimatedIDE";

const statistics = [
  { value: "15K+", label: "Repositories" },
  { value: "2M+", label: "Embeddings" },
  { value: "99%", label: "Accuracy" },
];

export default function Hero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [0, 5]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden" style={{ perspective: "1200px" }}>
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:flex-row lg:gap-16">
        <motion.div className="w-full min-w-0 lg:w-[45%]" style={{ y: y1, rotateX, opacity }}>
          <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}>
              <span className={`inline-block rounded-full border px-4 py-1.5 text-sm backdrop-blur-sm sm:text-base md:px-5 md:py-2 md:text-lg ${
                isDark
                  ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                  : "border-violet-300 bg-violet-100 text-violet-700"
              }`}>
                AI Powered Software Engineering
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
              className="mt-6 text-4xl font-black leading-[0.95] sm:text-5xl md:mt-8 md:text-6xl lg:text-7xl xl:text-8xl" style={{ transformStyle: "preserve-3d" }}>
              <span className="block">Analyze</span>
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent" style={{ transform: "translateZ(30px)" }}>
                Any Repository
              </span>
              <span className="block">With AI</span>
            </motion.h1>

            <div className={`mt-6 h-10 text-lg sm:text-xl md:mt-8 md:h-12 md:text-2xl ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              <TypeAnimation
                sequence={["Explain Code", 1500, "Review Pull Requests", 1500, "Generate Documentation", 1500, "Visualize Architecture", 1500, "Chat With Your Repository", 1500]}
                repeat={Infinity}
              />
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
              className={`mt-6 max-w-lg text-base leading-relaxed sm:text-lg md:mt-8 md:text-xl lg:text-2xl ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              AI Software Engineering Agent understands your GitHub repositories, reviews code, explains architecture, generates documentation and helps developers ship faster.
            </motion.p>

            <div className="mt-8 flex flex-wrap gap-4 sm:gap-5 md:mt-10">
              <motion.div whileHover={{ scale: 1.08, rotateY: 5 }} whileTap={{ scale: 0.95 }} style={{ transformStyle: "preserve-3d" }}>
                <Link to="/dashboard" className="inline-block rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40 sm:px-8 sm:py-4 sm:text-base">
                  Start Free
                </Link>
              </motion.div>
              <motion.button whileHover={{ scale: 1.08, rotateY: -5 }} whileTap={{ scale: 0.95 }} style={{ transformStyle: "preserve-3d" }}
                className={`rounded-full border px-6 py-3 text-sm font-semibold backdrop-blur-sm sm:px-8 sm:py-4 sm:text-base ${
                  isDark ? "border-white/20 text-white" : "border-slate-300 text-slate-700"
                }`}>
                GitHub
              </motion.button>
            </div>

            <motion.div className="mt-10 flex gap-6 sm:gap-10 md:mt-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
              {statistics.map((stat) => (
                <motion.div key={stat.label} whileHover={{ scale: 1.1, rotateY: 8 }} style={{ transformStyle: "preserve-3d" }} className="cursor-default">
                  <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">{stat.value}</h2>
                  <p className={`mt-1 text-xs sm:text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className="flex w-full min-w-0 justify-center lg:w-[55%]" style={{ y: y2 }}>
          <AnimatedIDE />
        </motion.div>
      </div>

      {[
        { cls: "right-[8%] top-[15%] h-24 w-24", bg: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))", r: "20%", rx: [0, 360], ry: [0, 360], dur: [12, 16] },
        { cls: "bottom-[20%] left-[5%] h-16 w-16", bg: "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(99,102,241,0.3))", r: "30%", rx: [0, 180, 360], ry: [0, 180, 360], dur: [10, 14] },
        { cls: "bottom-[10%] right-[20%] h-12 w-12", bg: "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(244,63,94,0.3))", r: "50%", rx: [0, -360], ry: [0, 360], dur: [18, 12] },
      ].map((s, i) => (
        <motion.div key={i} className={`absolute hidden lg:block ${s.cls}`}
          animate={{ rotateX: s.rx, rotateY: s.ry, y: [0, -20, 0] }}
          transition={{ rotateX: { repeat: Infinity, duration: s.dur[0], ease: "linear" }, rotateY: { repeat: Infinity, duration: s.dur[1], ease: "linear" }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
          style={{ transformStyle: "preserve-3d", background: s.bg, borderRadius: s.r, border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
        />
      ))}
    </section>
  );
}
