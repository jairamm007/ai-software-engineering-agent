import { useTheme } from "@/context/ThemeContext";

export default function SectionDivider() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div className={`h-px ${isDark ? "bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" : "bg-gradient-to-r from-transparent via-slate-200 to-transparent"}`} />
    </div>
  );
}
