import { useTheme } from "@/context/ThemeContext";
import { Brain, ExternalLink } from "lucide-react";
import type { SemanticChunk } from "@/services/semanticSearch";

interface Props {
  results: SemanticChunk[];
}

function formatDistance(distance: number): string {
  const similarity = ((1 - distance) * 100).toFixed(1);
  return `${similarity}%`;
}

function getRelevanceColor(distance: number): string {
  if (distance < 0.3) return "text-emerald-400";
  if (distance < 0.5) return "text-yellow-400";
  if (distance < 0.7) return "text-orange-400";
  return "text-red-400";
}

export default function SemanticSearch({ results }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (results.length === 0) {
    return (
      <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <Brain size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          No semantic results found. Try a different query.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Semantic Matches
        </h3>
        <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {results.length} results
        </span>
      </div>

      {results.map((chunk, i) => (
        <div
          key={`${chunk.filePath}:${chunk.startLine}-${chunk.endLine}-${i}`}
          className={`rounded-xl border p-4 transition-colors hover:border-[var(--accent)]/50 ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
          }`}
        >
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {chunk.filePath}
              </span>
              <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                L{chunk.startLine}-{chunk.endLine}
              </span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getRelevanceColor(chunk.distance)}`}>
              {formatDistance(chunk.distance)}
            </span>
          </div>
          <pre className={`overflow-x-auto rounded-lg p-3 text-xs leading-relaxed ${
            isDark ? "bg-black/30 text-slate-300" : "bg-slate-50 text-slate-700"
          }`}>
            <code>{chunk.content.slice(0, 500)}{chunk.content.length > 500 ? "..." : ""}</code>
          </pre>
        </div>
      ))}
    </div>
  );
}
