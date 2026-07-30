import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import AnimatedIDE from "@/components/landing/AnimatedIDE";
import { ArrowRight, Zap, Shield } from "lucide-react";
import Logo from "@/components/common/Logo";

const stats = [
  { value: "15K+", label: "Repositories" },
  { value: "2M+", label: "Code Chunks" },
  { value: "99%", label: "Accuracy" },
];

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 0.2 + i * 0.15,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function Hero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.97]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden">
      {/* Subtle gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-fuchsia-600/5 rounded-full blur-[130px]" />
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 pt-24 pb-16 sm:px-6 sm:pt-32 md:px-8 lg:flex-row lg:gap-16 lg:pt-32"
      >
        {/* Left content */}
        <div className="w-full lg:w-[48%]">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <Logo size="sm" />
            <span className={`text-sm font-medium ${isDark ? "text-violet-300" : "text-violet-700"}`}>AI Powered Software Engineering</span>
          </motion.div>

          {/* Main heading - each word staggers in */}
          <div className="mt-8 font-[Outfit] text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <div className="overflow-hidden">
              <motion.span
                custom={0}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className={`block ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Analyze
              </motion.span>
            </div>
            <div className="overflow-hidden">
              <motion.span
                custom={1}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className={`block ${isDark ? "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400" : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"} bg-clip-text text-transparent`}
              >
                Any Repository
              </motion.span>
            </div>
            <div className="overflow-hidden">
              <motion.span
                custom={2}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className={`block ${isDark ? "text-white" : "text-slate-900"}`}
              >
                With AI
              </motion.span>
            </div>
          </div>

          {/* Typing animation */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className={`mt-6 h-10 text-lg sm:text-xl md:h-12 md:text-2xl font-[Outfit] font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            <TypeAnimation
              sequence={[
                "Explain Code", 1500,
                "Review Pull Requests", 1500,
                "Generate Documentation", 1500,
                "Visualize Architecture", 1500,
                "Chat With Your Repository", 1500,
              ]}
              repeat={Infinity}
              wrapper="span"
            />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className={`mt-6 max-w-lg text-base leading-relaxed sm:text-lg md:text-xl font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Repo Verify understands your GitHub repositories, reviews code, explains architecture, generates documentation and helps developers ship faster.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/dashboard"
                onClick={() => window.scrollTo({ top: 0 })}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
              >
                Start Free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#features"
                className={`inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition-colors ${
                  isDark ? "border-white/15 text-white hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            {[
              { icon: Zap, text: "Instant Analysis" },
              { icon: Shield, text: "Secure & Private" },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                <Icon size={14} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                <span>{text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="mt-10 flex gap-8 sm:gap-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.1 }}
                className="text-center"
              >
                <div className={`text-2xl font-extrabold sm:text-3xl md:text-4xl font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                  {stat.value}
                </div>
                <div className={`mt-1 text-xs sm:text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right - IDE */}
        <motion.div
          initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-[52%]"
        >
          <AnimatedIDE />
        </motion.div>
      </motion.div>
    </section>
  );
}
