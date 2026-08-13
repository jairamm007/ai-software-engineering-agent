import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";
import GradientBorder from "./GradientBorder";

interface CTACardProps {
  title: string;
  subtitle: string;
  action: ReactNode;
  className?: string;
  from?: string;
  to?: string;
  icon?: ReactNode;
}

export default function CTACard({ title, subtitle, action, className, from = "#8b5cf6", to = "#ec4899", icon }: CTACardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Reveal y={36} className={className}>
      <GradientBorder from={from} to={to} radius="1.5rem">
        <div
          className={cn(
            "relative overflow-hidden px-6 py-12 text-center sm:px-10",
            isDark ? "bg-[#0a0516]/95" : "bg-white/95"
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(60% 90% at 50% 0%, ${from}1f, transparent 70%)` }}
          />
          <div className="relative">
            {icon && (
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className={cn(
                  "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                  `from-violet-600 to-fuchsia-600`
                )}
              >
                {icon}
              </motion.div>
            )}
            <h3 className="font-[Outfit] text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h3>
            <p className={cn("mx-auto mt-3 max-w-md text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>{subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">{action}</div>
          </div>
        </div>
      </GradientBorder>
    </Reveal>
  );
}
