import type { AIHistoryItem } from "@/types/ai";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  items: AIHistoryItem[];
  selectedItemId: string | null;
  onSelect: (item: AIHistoryItem) => void;
  onClear: () => void;
}

export default function AIHistory({ items, selectedItemId, onSelect, onClear }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>AI History</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={items.length === 0}
          className={`text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Clear
        </button>
      </div>

      {items.length > 0 ? (
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                item.id === selectedItemId
                  ? isDark
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-violet-500 bg-violet-50"
                  : isDark
                    ? "border-white/10 hover:bg-white/5"
                    : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{item.title}</div>
              <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {item.createdAt.toLocaleTimeString()}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No AI actions yet.</p>
      )}
    </div>
  );
}
