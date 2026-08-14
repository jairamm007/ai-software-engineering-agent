import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className={cn(
        "relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 active:translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "accent-gradient text-white shadow-md shadow-[color-mix(in_srgb,var(--accent)_30%,transparent)] hover:shadow-lg hover:shadow-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:brightness-110",
        variant === "secondary" &&
          (isDark
            ? "border border-white/10 bg-[#151515] text-slate-200 hover:bg-[#1a1a1a] hover:border-white/20"
            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"),
        variant === "ghost" &&
          (isDark
            ? "text-slate-300 hover:bg-white/5 hover:text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"),
        variant === "primary" && "shine",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
