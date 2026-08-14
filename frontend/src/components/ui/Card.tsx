import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg",
        isDark
          ? "border border-white/10 surface-card shadow-black/20 hover:shadow-black/40 hover:border-white/20 hover:bg-[#1a1a1a]"
          : "border border-slate-200 bg-white shadow-slate-200/50 hover:shadow-slate-300/60 hover:border-slate-300",
        className
      )}
    >
      {/* Subtle top accent sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--accent)_45%,transparent)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </div>
  );
}
