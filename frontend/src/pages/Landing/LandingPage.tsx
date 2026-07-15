import { useTheme } from "@/context/ThemeContext";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import CTA from "@/components/landing/CTA";
import Features from "@/components/landing/Features";
import Hero from "@/components/landing/Hero";
import SectionDivider from "@/components/landing/SectionDivider";
import Statistics from "@/components/landing/Statistics";
import UseCases from "@/components/landing/UseCases";
import Workflow from "@/components/landing/Workflow";

export default function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main className={`relative min-h-screen overflow-x-hidden font-[Inter] transition-colors duration-300 ${
      isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900"
    }`}>
      <AnimatedBackground />
      <div className="relative z-10">
        <Hero />
        <Features />
        <SectionDivider />
        <Statistics />
        <SectionDivider />
        <Workflow />
        <SectionDivider />
        <UseCases />
        <SectionDivider />
        <CTA />
      </div>
    </main>
  );
}
