import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { getArchitectureDiagram, type ArchitectureModule } from "@/services/repositoryIntelligence";
import { Box, ArrowRight, Lightbulb } from "lucide-react";

interface Props {
  repositoryId: string;

}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  page: { bg: "#3b82f6", border: "#2563eb", text: "#fff" },
  component: { bg: "#8b5cf6", border: "#7c3aed", text: "#fff" },
  hook: { bg: "#06b6d4", border: "#0891b2", text: "#fff" },
  context: { bg: "#ec4899", border: "#db2777", text: "#fff" },
  controller: { bg: "#f59e0b", border: "#d97706", text: "#fff" },
  route: { bg: "#84cc16", border: "#65a30d", text: "#fff" },
  service: { bg: "#22c55e", border: "#16a34a", text: "#fff" },
  model: { bg: "#ef4444", border: "#dc2626", text: "#fff" },
  util: { bg: "#6b7280", border: "#4b5563", text: "#fff" },
  config: { bg: "#a855f7", border: "#9333ea", text: "#fff" },
  test: { bg: "#14b8a6", border: "#0d9488", text: "#fff" },
  other: { bg: "#64748b", border: "#475569", text: "#fff" },
};

const LAYER_ORDER = ["page", "component", "hook", "context", "controller", "route", "service", "model", "util", "config", "test", "other"];

function formatLines(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function ModuleCard({ module, isDark, isSelected, onClick }: { module: ArchitectureModule; isDark: boolean; isSelected: boolean; onClick: () => void }) {
  const colors = TYPE_COLORS[module.type] || TYPE_COLORS.other;
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:scale-[1.02] ${
        isSelected ? "ring-2 ring-[var(--accent)] ring-offset-2" : ""
      } ${isDark ? "ring-offset-slate-900" : "ring-offset-white"}`}
      style={{ borderColor: colors.border, backgroundColor: `${colors.bg}15` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: colors.bg, color: colors.text }}>
          {module.type}
        </span>
        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{module.files.length} files</span>
      </div>
      <h4 className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-slate-900"}`}>{module.name}</h4>
      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{formatLines(module.lineCount)} lines</p>
      {module.dependencies.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {module.dependencies.slice(0, 3).map(dep => (
            <span key={dep} className={`rounded-full px-2 py-0.5 text-[10px] ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              {dep}
            </span>
          ))}
          {module.dependencies.length > 3 && (
            <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>+{module.dependencies.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

function DependencyFlow({ modules, isDark }: { modules: ArchitectureModule[]; isDark: boolean }) {
  const edges = useMemo(() => {
    const result: { from: string; to: string }[] = [];
    for (const mod of modules) {
      for (const dep of mod.dependencies) {
        result.push({ from: mod.id, to: dep });
      }
    }
    return result;
  }, [modules]);

  if (edges.length === 0) return null;

  return (
    <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Module Dependencies</h3>
      <div className="space-y-2">
        {edges.slice(0, 20).map((edge, i) => {
          const fromMod = modules.find(m => m.id === edge.from);
          const toMod = modules.find(m => m.id === edge.to);
          if (!fromMod || !toMod) return null;
          const fromColor = TYPE_COLORS[fromMod.type]?.bg || "#64748b";
          const toColor = TYPE_COLORS[toMod.type]?.bg || "#64748b";
          return (
            <div key={i} className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${fromColor}30`, color: fromColor }}>{fromMod.name}</span>
              <ArrowRight size={14} className="shrink-0 text-slate-400" />
              <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${toColor}30`, color: toColor }}>{toMod.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ArchitectureDiagram({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedModule, setSelectedModule] = useState<ArchitectureModule | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "layers">("layers");

  const query = useQuery({
    queryKey: ["architecture", repositoryId],
    queryFn: () => getArchitectureDiagram(repositoryId),
  });

  const groupedByType = useMemo(() => {
    if (!query.data) return {};
    const groups: Record<string, ArchitectureModule[]> = {};
    for (const mod of query.data.modules) {
      if (!groups[mod.type]) groups[mod.type] = [];
      groups[mod.type].push(mod);
    }
    return groups;
  }, [query.data]);

  if (query.isLoading) return <div className={`h-[400px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  if (query.isError || !query.data) return <p className="text-red-500">Failed to load architecture.</p>;

  return (
    <div className="space-y-6">
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
          {query.data.modules.length} modules
        </span>
        <div className="flex gap-1 ml-auto">
          {(["layers", "grid"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === mode
                  ? "bg-[var(--accent)] text-white"
                  : isDark ? "bg-white/10 text-slate-300 hover:bg-white/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "layers" ? (
        <div className="space-y-6">
          {LAYER_ORDER.map(type => {
            const mods = groupedByType[type];
            if (!mods?.length) return null;
            const colors = TYPE_COLORS[type];
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Box size={16} style={{ color: colors.bg }} />
                  <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {type}s ({mods.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {mods.map(mod => (
                    <ModuleCard
                      key={mod.id}
                      module={mod}
                      isDark={isDark}
                      isSelected={selectedModule?.id === mod.id}
                      onClick={() => setSelectedModule(selectedModule?.id === mod.id ? null : mod)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {query.data.modules.map(mod => (
            <ModuleCard
              key={mod.id}
              module={mod}
              isDark={isDark}
              isSelected={selectedModule?.id === mod.id}
              onClick={() => setSelectedModule(selectedModule?.id === mod.id ? null : mod)}
            />
          ))}
        </div>
      )}

      {selectedModule && (
        <div className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>{selectedModule.name}</h3>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {selectedModule.files.length} files · {formatLines(selectedModule.lineCount)} lines · Dependencies: {selectedModule.dependencies.length || "none"}
          </p>
          {selectedModule.files.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Files:</p>
              <div className="max-h-32 overflow-auto space-y-0.5">
                {selectedModule.files.map(f => (
                  <p key={f} className={`font-mono text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>{f}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <DependencyFlow modules={query.data.modules} isDark={isDark} />

      {query.data.suggestions.length > 0 && (
        <div className={`rounded-2xl border p-5 ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-200 bg-amber-50"}`}>
          <h3 className={`flex items-center gap-2 font-semibold mb-3 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
            <Lightbulb size={16} /> Architecture Suggestions
          </h3>
          <ul className="space-y-2">
            {query.data.suggestions.map((s, i) => (
              <li key={i} className={`text-sm ${isDark ? "text-amber-200/80" : "text-amber-800"}`}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
