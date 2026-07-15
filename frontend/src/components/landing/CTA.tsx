import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRef } from "react";

export default function CTA() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end center"] });
  const glowScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.15]);

  return (
    <section ref={sectionRef} className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={`relative overflow-hidden rounded-3xl border px-6 py-14 backdrop-blur-xl sm:px-8 sm:py-16 md:px-16 md:py-20 ${
            isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white shadow-xl"
          }`}>
            {/* Background gradient that moves on scroll */}
            <motion.div style={{ scale: glowScale, opacity: glowOpacity }} className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-pink-600/20" />
            </motion.div>
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative">
              {/* Animated badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 200 }}
                className={`mb-7 inline-flex items-center gap-2 rounded-full border px-5 py-1.5 ${isDark ? "border-violet-500/20 bg-violet-500/10" : "border-violet-200 bg-violet-100"}`}
              >
                <Sparkles size={14} className={isDark ? "text-violet-400" : "text-violet-600"} />
                <span className={`text-sm font-medium ${isDark ? "text-violet-300" : "text-violet-700"}`}>Open source friendly</span>
              </motion.div>

              {/* Animated heading - words appear one by one */}
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`font-[Outfit] text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl ${isDark ? "" : "text-slate-900"}`}
                >
                  Ready to Understand Your{" "}
                  <span className={`${isDark ? "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400" : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"} bg-clip-text text-transparent`}>
                    Codebase
                  </span>
                  ?
                </motion.h2>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className={`mx-auto mt-6 max-w-2xl text-lg font-[Inter] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Start analyzing your repositories in minutes. Get AI-powered code reviews,
                architecture maps, documentation, and more.
              </motion.p>

              {/* Animated buttons with stagger */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/dashboard"
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/40"
                  >
                    Get Started Free
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <a
                    href="#features"
                    className={`inline-flex items-center gap-2 rounded-full border px-8 py-4 text-base font-semibold transition-colors ${
                      isDark ? "border-white/15 text-white hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Learn More
                  </a>
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className={`mt-8 text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Start for free. Upgrade anytime.
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
