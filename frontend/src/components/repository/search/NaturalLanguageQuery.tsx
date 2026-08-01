import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sparkles, Send, Lightbulb } from "lucide-react";
import { LoadingIndicator } from "@/components/LoadingIndicator";

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "authentication middleware",
  "error handling patterns",
  "database connection setup",
  "API route handlers",
  "React hooks and state management",
  "unit test utilities",
];

export default function NaturalLanguageQuery({ onSearch, isLoading }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-purple-400" />
        <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
          Natural Language Search
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you're looking for in natural language..."
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            isDark
              ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-[var(--accent)]"
              : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[var(--accent)]"
          } focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50`}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? <LoadingIndicator size="sm" /> : <Send size={14} />}
          Search
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Lightbulb size={12} className={isDark ? "text-slate-500" : "text-slate-400"} />
          <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Try:</span>
        </div>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); onSearch(s); }}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              isDark
                ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
