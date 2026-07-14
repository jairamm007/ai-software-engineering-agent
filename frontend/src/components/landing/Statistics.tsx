import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

interface StatProps { end: number; suffix: string; label: string; duration?: number; }

function AnimatedCounter({ end, suffix, label, duration = 2 }: StatProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const startTime = Date.now();
        const step = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min(elapsed / duration, 1);
          setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * end));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40, rotateX: -15 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }} whileHover={{ scale: 1.08, rotateY: 8, z: 20 }} transition={{ duration: 0.5 }}
      className="cursor-default text-center" style={{ transformStyle: "preserve-3d" }}>
      <div className="text-4xl font-black sm:text-5xl md:text-6xl">{count}{suffix}</div>
      <div className="mt-3 text-lg text-slate-400">{label}</div>
    </motion.div>
  );
}

const stats = [
  { end: 15000, suffix: "+", label: "Repositories Analyzed" },
  { end: 2, suffix: "M+", label: "Code Chunks Indexed" },
  { end: 99, suffix: "%", label: "Analysis Accuracy" },
  { end: 500, suffix: "+", label: "Teams Using It" },
];

export default function Statistics() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32" ref={containerRef}>
      <div className="mx-auto max-w-7xl">
        <motion.div style={{ rotateX, scale, transformStyle: "preserve-3d" }}
          className={`rounded-3xl border p-8 backdrop-blur-xl sm:p-12 md:p-16 ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-xl"
          }`}>
          <div className="mb-16 text-center">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Trusted by <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">Thousands</span>
            </motion.h2>
            <p className={`mx-auto mt-6 max-w-xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Powering code intelligence for development teams around the world.
            </p>
          </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => <AnimatedCounter key={stat.label} {...stat} />)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
