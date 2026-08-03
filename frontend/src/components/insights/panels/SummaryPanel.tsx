import { useTheme } from "@/context/ThemeContext";
import type { ProjectInsights } from "@/types/insights";

export default function SummaryPanel({ insights }: { insights: ProjectInsights }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const s = insights.summary;

  const rows: { label: string; value: string }[] = [
    { label: "Name", value: s.name },
    { label: "Description", value: s.description ?? "N/A" },
    { label: "Primary language", value: s.primaryLanguage },
    { label: "Frontend", value: s.frontendFramework ?? "N/A" },
    { label: "Backend", value: s.backendFramework ?? "N/A" },
    { label: "Database", value: s.database ?? "N/A" },
    { label: "Vector database", value: s.vectorDb ?? "N/A" },
    { label: "AI framework", value: s.aiFramework ?? "N/A" },
    { label: "Total files", value: String(s.totalFiles) },
    { label: "Total folders", value: String(s.totalFolders) },
    { label: "Modules", value: String(s.moduleCount) },
  ];

  return (
    <div className={`overflow-hidden rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.label} className={index % 2 === 0 ? (isDark ? "bg-white/[0.02]" : "bg-slate-50/60") : ""}>
              <td className={`w-1/3 px-4 py-2.5 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {row.label}
              </td>
              <td className={`px-4 py-2.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {row.label === "Description" ? row.value : <span className="font-medium">{row.value}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
