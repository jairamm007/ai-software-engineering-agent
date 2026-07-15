import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

interface StatProps {
  end: number;
  suffix: string;
  label: string;
  isDark: boolean;
  index: number;
  duration?: number;
  gradient: string;
}

function AnimatedCounter({ end, suffix, label, isDark, index, duration = 2.5, gradient }: StatProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const step = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4, scale: 1.05 }}
      className="cursor-default text-center relative"
    >
      {/* Glow ring behind number */}
      <div className={`absolute -inset-4 bg-gradient-to-b ${gradient} opacity-0 hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-500`} />

      <div className="relative">
        <div className="font-[Outfit] text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          {count}{suffix}
        </div>
        <div className={`mt-3 text-sm sm:text-base font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}

const stats = [
  { end: 15000, suffix: "+", label: "Repositories Analyzed", gradient: "from-violet-500 to-purple-600" },
  { end: 2, suffix: "M+", label: "Code Chunks Indexed", gradient: "from-fuchsia-500 to-pink-600" },
  { end: 99, suffix: "%", label: "Analysis Accuracy", gradient: "from-cyan-500 to-blue-600" },
  { end: 500, suffix: "+", label: "Teams Using It", gradient: "from-emerald-500 to-teal-600" },
];

export default function Statistics() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.97]);

  return (
    <section ref={sectionRef} className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ rotateX, scale, transformStyle: "preserve-3d" }}
          className={`relative overflow-hidden rounded-3xl border p-8 backdrop-blur-xl sm:p-12 md:p-16 ${
            isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white shadow-xl"
          }`}
        >
          {/* Animated gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-fuchsia-600/5 pointer-events-none" />

          {/* Decorative dots pattern */}
          <div className="absolute top-6 right-6 grid grid-cols-3 gap-1 opacity-20">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.8 + i * 0.05, duration: 0.3 }}
                className="h-1 w-1 rounded-full bg-violet-500"
              />
            ))}
          </div>

          <div className="relative mb-14 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`font-[Outfit] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl ${isDark ? "" : "text-slate-900"}`}
            >
              Trusted by{" "}
              <span className={`${isDark ? "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400" : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"} bg-clip-text text-transparent`}>
                Thousands
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={`mx-auto mt-5 max-w-xl text-lg font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Powering code intelligence for development teams around the world.
            </motion.p>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <AnimatedCounter key={stat.label} {...stat} isDark={isDark} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
