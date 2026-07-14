import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

export default function CTA() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section id="pricing" className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32">
      <div className="mx-auto max-w-4xl text-center" style={{ perspective: "1200px" }}>
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: -10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className={`relative rounded-3xl border px-6 py-12 backdrop-blur-xl sm:px-8 sm:py-16 md:px-16 md:py-20 ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-xl"
          }`}>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/10 via-transparent to-fuchsia-600/10" />

            <div className="relative">
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Ready to Understand Your{" "}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                  Codebase
                </span>
                ?
              </h2>
              <p className={`mx-auto mt-6 max-w-2xl text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Start analyzing your repositories in minutes. Get AI-powered code reviews,
                architecture maps, documentation, and more.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
                <motion.div
                  whileHover={{ scale: 1.08, rotateY: 5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Link
                    to="/dashboard"
                    className="inline-block rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40 sm:px-10 sm:py-4 sm:text-lg"
                  >
                    Get Started Free
                  </Link>
                </motion.div>
                <motion.a
                  href="#features"
                  whileHover={{ scale: 1.08, rotateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`rounded-full border px-6 py-3 text-sm font-semibold transition-colors sm:px-10 sm:py-4 sm:text-lg ${
                    isDark ? "border-white/20 text-white hover:bg-white/10" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Learn More
                </motion.a>
              </div>

              <p className={`mt-8 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                No credit card required. Free tier includes up to 5 repositories.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
