import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { generateArchitectureDocs } from "@/services/documentationGenerator";
import { Box, ArrowRight, Layers, Compass } from "lucide-react";

interface Props {
  repositoryId: string;
}

const LAYER_COLORS: Record<string, string> = {
  Pages: "#3b82f6", Components: "#8b5cf6", Services: "#22c55e",
  Models: "#ef4444", Utils: "#64748b", Config: "#f59e0b",
  Tests: "#14b8a6", Controllers: "#ec4899", Routes: "#84cc16",
};

function formatLines(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function ArchitectureDocsGenerator({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const query = useQuery({
    queryKey: ["arch-docs-gen", repositoryId],
    queryFn: () => generateArchitectureDocs(repositoryId),
  });

  if (query.isLoading) return <div className={`h-[400px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  if (query.isError || !query.data) return <p className="text-red-500">Failed to generate architecture docs.</p>;

  const data = query.data;

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <p className={isDark ? "text-slate-300" : "text-slate-600"}>{data.summary}</p>
      </div>

      {data.entryPoints.length > 0 && (
        <div className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
            <Compass size={16} /> Entry Points
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.entryPoints.map((ep, i) => (
              <span key={i} className={`rounded-lg px-2.5 py-1 font-mono text-xs ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-700"}`}>{ep}</span>
            ))}
          </div>
        </div>
      )}

      {data.layers.length > 0 && (
        <div className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <h3 className={`flex items-center gap-2 text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            <Layers size={16} /> Layers
          </h3>
          <div className="space-y-3">
            {data.layers.map((layer, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: LAYER_COLORS[layer.name] || "#64748b" }} />
                  <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{layer.name}</span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>({layer.modules.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-5">
                  {layer.modules.map((mod, j) => (
                    <span key={j} className={`rounded-full px-2.5 py-0.5 text-xs ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>{mod}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <h3 className={`flex items-center gap-2 text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
          <Box size={16} /> Modules ({data.modules.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.modules.map((mod, i) => {
            const color = LAYER_COLORS[Object.keys(LAYER_COLORS).find(k => mod.name.toLowerCase().includes(k.toLowerCase())) || ""] || "#64748b";
            return (
              <div key={i} className={`rounded-xl border p-4 transition-all hover:scale-[1.01]`} style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: color }}>{mod.name}</span>
                </div>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{mod.fileCount} files · {formatLines(mod.lineCount)} lines</p>
                {mod.exports.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {mod.exports.slice(0, 4).map((exp, j) => (
                      <span key={j} className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>{exp}</span>
                    ))}
                    {mod.exports.length > 4 && <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>+{mod.exports.length - 4}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {data.dependencies.length > 0 && (
        <div className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <h3 className={`flex items-center gap-2 text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            <ArrowRight size={16} /> Dependencies
          </h3>
          <div className="space-y-1.5">
            {data.dependencies.slice(0, 30).map((dep, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${isDark ? "bg-white/10" : "bg-slate-100"}`}>{dep.from}</span>
                <ArrowRight size={12} className="text-slate-400" />
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${isDark ? "bg-white/10" : "bg-slate-100"}`}>{dep.to}</span>
                <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>({dep.weight} imports)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
