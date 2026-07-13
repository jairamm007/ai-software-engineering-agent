import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <input
      className={cn(
        isDark
          ? "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-violet-500"
          : "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500",
        className
      )}
      {...props}
    />
  );
}
