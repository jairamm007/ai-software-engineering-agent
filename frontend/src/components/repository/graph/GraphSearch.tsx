import type { RefObject } from "react";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

export default function GraphSearch({ value, onChange, inputRef }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search files... (/)"
      className={`min-w-52 flex-1 rounded-lg border px-3 py-2 text-sm outline-none ${
        isDark
          ? "border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-500"
          : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
      }`}
    />
  );
}
