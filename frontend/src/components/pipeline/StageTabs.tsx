import { useTheme } from "@/context/ThemeContext";
import type { RunStageKey, RunStageStatus } from "@/types/pipeline";
import { STAGE_DOT_COLOR, STAGE_LABELS, STAGE_ORDER, stageStatusOf } from "./runStatus.tsx";

interface Props {
  active: RunStageKey;
  status?: RunStageStatus;
  onSelect: (key: RunStageKey) => void;
}

export default function StageTabs({ active, status, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-0 dark:border-white/[0.06]">
      {STAGE_ORDER.map((key) => {
        const stageStatus = stageStatusOf(status, key);
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? isDark
                  ? "text-white"
                  : "text-slate-900"
                : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${STAGE_DOT_COLOR[stageStatus]}`}
              aria-hidden
            />
            {STAGE_LABELS[key]}
            {isActive && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full accent-gradient" />
            )}
          </button>
        );
      })}
    </div>
  );
}
