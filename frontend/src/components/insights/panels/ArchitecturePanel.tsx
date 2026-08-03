import { ArrowDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Badge from "@/components/pipeline/Badge";
import type { ProjectInsights } from "@/types/insights";

export default function ArchitecturePanel({ insights }: { insights: ProjectInsights }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const arch = insights.architecture;

  return (
    <div className="space-y-5">
      <div className={`rounded-lg border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
        <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>{arch.prose}</p>
      </div>

      <div className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
        <ArrowDown size={14} className="shrink-0" />
        <span className="font-mono text-xs leading-relaxed">{arch.requestFlow}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {arch.layers.map((layer) => (
          <div key={layer.name} className={`rounded-lg border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{layer.name}</h3>
            <ul className="mt-2 space-y-1">
              {layer.modules.map((m) => (
                <li key={m} className={`flex items-center gap-2 text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {arch.entryPoints.length > 0 && (
        <div>
          <h3 className={`mb-2 text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Entry points</h3>
          <div className="flex flex-wrap gap-2">
            {arch.entryPoints.map((entry) => (
              <Badge key={entry} className="bg-blue-500/15 text-blue-500">{entry}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
