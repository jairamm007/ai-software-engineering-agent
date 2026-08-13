import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import Hero from "@/components/landing/Hero";
import PlexusTerrainBackground from "@/components/landing/PlexusTerrainBackground";
import SectionDivider from "@/components/landing/SectionDivider";
import { ArrowUp, Sparkles } from "lucide-react";

const Features = lazy(() => import("@/components/landing/Features"));
const Statistics = lazy(() => import("@/components/landing/Statistics"));
const Workflow = lazy(() => import("@/components/landing/Workflow"));
const UseCases = lazy(() => import("@/components/landing/UseCases"));
const CTA = lazy(() => import("@/components/landing/CTA"));

function SectionLoader() {
  return <div className="h-20 w-full animate-pulse rounded-lg bg-slate-200/5 dark:bg-slate-800/50" />;
}

export default function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className={`relative min-h-screen overflow-x-hidden font-[Inter] transition-colors duration-300 ${
      isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900"
    }`}>
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
      />

      {/* Plexus night-sky background throughout the page */}
      <PlexusTerrainBackground />

      {/* Ambient grid glow at very top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-violet-600/[0.06] to-transparent" />

      <div className="relative z-10">
        <Hero />

        <SectionDivider />

        <Suspense fallback={<SectionLoader />}>
          <Features />
        </Suspense>

        <SectionDivider />

        <Suspense fallback={<SectionLoader />}>
          <Statistics />
        </Suspense>

        <SectionDivider />

        <Suspense fallback={<SectionLoader />}>
          <Workflow />
        </Suspense>

        <SectionDivider />

        <Suspense fallback={<SectionLoader />}>
          <UseCases />
        </Suspense>

        <SectionDivider />

        <Suspense fallback={<SectionLoader />}>
          <CTA />
        </Suspense>
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(139,92,246,0.5)" }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full accent-gradient text-white shadow-lg accent-shadow cursor-pointer"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating sparkle deco (hidden on small screens) */}
      <motion.div
        animate={{ y: [0, -12, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="pointer-events-none fixed bottom-10 left-10 z-0 hidden lg:block"
      >
        <Sparkles size={28} className="text-violet-500/30" />
      </motion.div>
    </main>
  );
}
