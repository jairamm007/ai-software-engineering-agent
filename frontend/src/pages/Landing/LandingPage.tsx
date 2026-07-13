import { useTheme } from "@/context/ThemeContext";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import CTA from "@/components/landing/CTA";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Statistics from "@/components/landing/Statistics";
import Workflow from "@/components/landing/Workflow";

export default function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main className={`relative min-h-screen overflow-x-hidden transition-colors duration-300 ${
      isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900"
    }`}>
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10">
        <Hero />
        <Statistics />
        <Features />
        <Workflow />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
