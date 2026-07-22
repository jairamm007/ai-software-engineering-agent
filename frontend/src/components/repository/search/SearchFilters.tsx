import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Search, Filter, X } from "lucide-react";
import type { SearchFilters } from "@/services/semanticSearch";

interface Props {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const LANGUAGES = [
  "TypeScript", "JavaScript", "Python", "Java", "Go", "Rust",
  "C++", "C", "Ruby", "PHP", "Swift", "Kotlin",
  "HTML", "CSS", "JSON", "YAML", "Markdown", "Shell", "SQL",
];

export default function SearchFilters({ filters, onFiltersChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = filters.language || filters.extension || filters.path || filters.minLines || filters.maxLines;

  return (
    <div className={`rounded-xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex w-full items-center justify-between px-4 py-3 text-sm font-medium ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-white">
              Active
            </span>
          )}
        </div>
        <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {isExpanded ? "Hide" : "Show"}
        </span>
      </button>

      {isExpanded && (
        <div className={`space-y-4 border-t px-4 pb-4 pt-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Language
              </label>
              <select
                value={filters.language || ""}
                onChange={(e) => onFiltersChange({ ...filters, language: e.target.value || undefined })}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-900"
                }`}
              >
                <option value="">All languages</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                File Extension
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>.</span>
                <input
                  type="text"
                  placeholder="ts, py, go..."
                  value={filters.extension || ""}
                  onChange={(e) => onFiltersChange({ ...filters, extension: e.target.value || undefined })}
                  className={`w-full rounded-lg border py-2 pl-6 pr-3 text-sm ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white placeholder-slate-500"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Path Contains
              </label>
              <input
                type="text"
                placeholder="src, components..."
                value={filters.path || ""}
                onChange={(e) => onFiltersChange({ ...filters, path: e.target.value || undefined })}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>

            <div>
              <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Min Lines
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minLines || ""}
                onChange={(e) => onFiltersChange({ ...filters, minLines: e.target.value ? parseInt(e.target.value) : undefined })}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>

            <div>
              <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Max Lines
              </label>
              <input
                type="number"
                placeholder="10000"
                value={filters.maxLines || ""}
                onChange={(e) => onFiltersChange({ ...filters, maxLines: e.target.value ? parseInt(e.target.value) : undefined })}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => onFiltersChange({})}
              className={`flex items-center gap-1.5 text-xs ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
            >
              <X size={12} />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
