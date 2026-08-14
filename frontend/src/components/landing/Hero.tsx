import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import AnimatedIDE from "@/components/landing/AnimatedIDE";
import { ArrowRight, Zap, Shield, ChevronDown, Sparkles } from "lucide-react";
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

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const orbX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const orbY = useTransform(springY, [-0.5, 0.5], [-20, 20]);
  const ideX = useTransform(springX, [-0.5, 0.5], [12, -12]);
  const ideY = useTransform(springY, [-0.5, 0.5], [8, -8]);

  const spotlightX = useTransform(springX, [-0.5, 0.5], ["45%", "55%"]);
  const spotlightY = useTransform(springY, [-0.5, 0.5], ["35%", "45%"]);
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${spotlightX} ${spotlightY}, ${isDark ? "rgba(139,92,246,0.10)" : "rgba(139,92,246,0.08)"}, transparent 60%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Mouse-follow spotlight */}
      <motion.div
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0"
      />

      {/* Subtle gradient overlays with parallax */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          style={{ x: orbX, y: orbY }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/8 rounded-full blur-[150px]"
        />
        <motion.div
          style={{ x: useTransform(springX, [-0.5, 0.5], [25, -25]), y: useTransform(springY, [-0.5, 0.5], [20, -20]) }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-fuchsia-600/5 rounded-full blur-[130px]"
        />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: isDark
            ? "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)"
            : "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 pt-24 pb-16 sm:px-6 sm:pt-32 md:px-8 lg:flex-row lg:gap-16 lg:pt-32"
      >
        {/* Left content */}
        <div className="w-full lg:w-[48%]">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <motion.span
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Logo size="sm" />
            </motion.span>
            <span className={`text-sm font-medium ${isDark ? "text-violet-300" : "text-violet-700"}`}>AI Powered Software Engineering</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
          </motion.div>

          {/* Main heading - each word staggers in */}
          <div className="mt-8 font-[Outfit] text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <div className="overflow-hidden">
              <motion.span
                custom={0}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className={`block hover-accent ${isDark ? "text-white" : "text-slate-900"}`}
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
                className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_6s_ease-in-out_infinite]"
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
                className={`block hover-accent ${isDark ? "text-white" : "text-slate-900"}`}
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/dashboard"
                onClick={() => window.scrollTo({ top: 0 })}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Start Free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
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
              { icon: Zap, text: "Instant Analysis", color: "text-emerald-400" },
              { icon: Shield, text: "Secure & Private", color: "text-emerald-400" },
              { icon: Sparkles, text: "AI Native", color: "text-fuchsia-400" },
            ].map(({ icon: Icon, text, color }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                whileHover={{ scale: 1.08, y: -2 }}
                className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                <Icon size={14} className={color} />
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
                whileHover={{ y: -3, scale: 1.05 }}
                className="text-center cursor-default"
              >
                <div className={`relative font-[Outfit] text-2xl font-extrabold sm:text-3xl md:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
                  <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">{stat.value}</span>
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
          style={{ x: ideX, y: ideY }}
          initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-[52%]"
        >
          <AnimatedIDE />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#features"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 cursor-pointer"
        aria-label="Scroll to features"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className={`flex flex-col items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          <span className="text-[10px] font-medium uppercase tracking-widest">Scroll</span>
          <ChevronDown size={18} />
        </motion.div>
      </motion.a>
    </section>
  );
}
