import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { getComplexityAnalysis, type ComplexityResult } from "@/services/repositoryIntelligence";
import { ArrowUpDown, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Props {
  repositoryId: string;

}

function getComplexityColor(c: number): string {
  if (c <= 10) return "#22c55e";
  if (c <= 25) return "#eab308";
  if (c <= 50) return "#f97316";
  return "#ef4444";
}

function getMaintainabilityColor(mi: number): string {
  if (mi >= 80) return "#22c55e";
  if (mi >= 60) return "#eab308";
  if (mi >= 40) return "#f97316";
  return "#ef4444";
}

function getComplexityLabel(c: number): { label: string; icon: React.ReactNode } {
  if (c <= 10) return { label: "Low", icon: <CheckCircle size={14} className="text-green-500" /> };
  if (c <= 25) return { label: "Moderate", icon: <AlertTriangle size={14} className="text-yellow-500" /> };
  return { label: "High", icon: <XCircle size={14} className="text-red-500" /> };
}

function SummaryCards({ data }: { data: ComplexityResult[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const totalFiles = data.length;
  const avgComplexity = totalFiles ? (data.reduce((s, d) => s + d.complexity, 0) / totalFiles).toFixed(1) : "0";
  const avgMI = totalFiles ? (data.reduce((s, d) => s + d.maintainabilityIndex, 0) / totalFiles).toFixed(1) : "0";
  const highComplexity = data.filter(d => d.complexity > 25).length;
  const totalLines = data.reduce((s, d) => s + d.lines, 0);
  const totalCode = data.reduce((s, d) => s + d.codeLines, 0);
  const totalComments = data.reduce((s, d) => s + d.commentLines, 0);

  const cards = [
    { label: "Total Files", value: totalFiles.toString(), color: "#8b5cf6" },
    { label: "Total Lines", value: totalLines.toLocaleString(), color: "#3b82f6" },
    { label: "Code Lines", value: totalCode.toLocaleString(), color: "#22c55e" },
    { label: "Comments", value: totalComments.toLocaleString(), color: "#06b6d4" },
    { label: "Avg Complexity", value: avgComplexity, color: parseFloat(avgComplexity) > 25 ? "#ef4444" : "#eab308" },
    { label: "Avg Maintainability", value: avgMI, color: parseFloat(avgMI) < 60 ? "#ef4444" : "#22c55e" },
    { label: "High Complexity", value: `${highComplexity} files`, color: highComplexity > 0 ? "#ef4444" : "#22c55e" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-3 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{card.label}</p>
        </div>
      ))}
    </div>
  );
}

function ComplexityTable({ data }: { data: ComplexityResult[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [sortKey, setSortKey] = useState<keyof ComplexityResult>("complexity");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "number" && typeof vb === "number") return sortAsc ? va - vb : vb - va;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [data, sortKey, sortAsc]);

  const toggleSort = (key: keyof ComplexityResult) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const headers: { key: keyof ComplexityResult; label: string; width?: string }[] = [
    { key: "file", label: "File", width: "30%" },
    { key: "lines", label: "Lines" },
    { key: "codeLines", label: "Code" },
    { key: "commentLines", label: "Comments" },
    { key: "functions", label: "Funcs" },
    { key: "classes", label: "Classes" },
    { key: "complexity", label: "Complexity" },
    { key: "maintainabilityIndex", label: "Maint." },
  ];

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/10" : "border-slate-200"}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={isDark ? "bg-white/5" : "bg-slate-50"}>
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => toggleSort(h.key)}
                  className={`cursor-pointer px-3 py-2.5 text-left font-medium whitespace-nowrap ${
                    isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                  style={h.width ? { width: h.width } : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {h.label}
                    {sortKey === h.key && <ArrowUpDown size={12} className="opacity-50" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 100).map((row, i) => {
              const { icon } = getComplexityLabel(row.complexity);
              return (
                <tr key={i} className={`border-t ${isDark ? "border-white/5 hover:bg-white/5" : "border-slate-100 hover:bg-slate-50"}`}>
                  <td className={`px-3 py-2 font-mono text-xs truncate max-w-[300px] ${isDark ? "text-slate-200" : "text-slate-700"}`}>{row.file}</td>
                  <td className={`px-3 py-2 text-right ${isDark ? "text-slate-300" : "text-slate-600"}`}>{row.lines}</td>
                  <td className={`px-3 py-2 text-right ${isDark ? "text-slate-300" : "text-slate-600"}`}>{row.codeLines}</td>
                  <td className={`px-3 py-2 text-right ${isDark ? "text-slate-300" : "text-slate-600"}`}>{row.commentLines}</td>
                  <td className={`px-3 py-2 text-right ${isDark ? "text-slate-300" : "text-slate-600"}`}>{row.functions}</td>
                  <td className={`px-3 py-2 text-right ${isDark ? "text-slate-300" : "text-slate-600"}`}>{row.classes}</td>
                  <td className="px-3 py-2 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      {icon}
                      <span style={{ color: getComplexityColor(row.complexity) }} className="font-medium">{row.complexity}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span style={{ color: getMaintainabilityColor(row.maintainabilityIndex) }} className="font-medium">
                      {row.maintainabilityIndex}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sorted.length > 100 && (
        <div className={`px-4 py-2 text-xs border-t ${isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>
          Showing top 100 of {sorted.length} files
        </div>
      )}
    </div>
  );
}

export default function ComplexityAnalysis({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const query = useQuery({
    queryKey: ["complexity", repositoryId],
    queryFn: () => getComplexityAnalysis(repositoryId),
  });

  if (query.isLoading) return <div className={`h-[400px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  if (query.isError || !query.data?.length) return <p className="text-slate-500">No complexity data found.</p>;

  return (
    <div className="space-y-6">
      <SummaryCards data={query.data} />
      <ComplexityTable data={query.data} />
    </div>
  );
}
