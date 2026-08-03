import { useTheme } from "@/context/ThemeContext";
import { INSIGHT_TABS } from "./insight-tabs";
import type { InsightSectionKey } from "@/types/insights";

interface Props {
  active: InsightSectionKey;
  onSelect: (key: InsightSectionKey) => void;
}

export default function InsightsTabs({ active, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex flex-wrap items-center gap-2 overflow-hidden rounded-xl border p-2 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      {INSIGHT_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onSelect(tab.key)}
          className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            active === tab.key
              ? "bg-[var(--accent)] text-white shadow-sm"
              : isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
