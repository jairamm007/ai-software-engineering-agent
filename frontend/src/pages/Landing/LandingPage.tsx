import { lazy, Suspense } from "react";
import { useTheme } from "@/context/ThemeContext";
import Hero from "@/components/landing/Hero";

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

  return (
    <main className={`relative min-h-screen overflow-x-hidden font-[Inter] transition-colors duration-300 ${
      isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900"
    }`}>
      <div className="relative z-10">
        <Hero />

        <Suspense fallback={<SectionLoader />}>
          <Features />
        </Suspense>

        <div className={`mx-auto h-px w-full max-w-4xl ${isDark ? "bg-white/5" : "bg-slate-200"}`} />

        <Suspense fallback={<SectionLoader />}>
          <Statistics />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <Workflow />
        </Suspense>

        <div className={`mx-auto h-px w-full max-w-4xl ${isDark ? "bg-white/5" : "bg-slate-200"}`} />

        <Suspense fallback={<SectionLoader />}>
          <UseCases />
        </Suspense>

        <div className={`mx-auto h-px w-full max-w-4xl ${isDark ? "bg-white/5" : "bg-slate-200"}`} />

        <Suspense fallback={<SectionLoader />}>
          <CTA />
        </Suspense>
      </div>
    </main>
  );
}
