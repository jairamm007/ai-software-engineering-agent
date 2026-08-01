import { useState } from "react";
import { motion } from "framer-motion";
import { Users, FolderGit2, Bot, Shield, Activity, Download, FileText } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { generateReport } from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const reportTypes = [
  {
    key: "users",
    label: "User Report",
    icon: Users,
    description: "User registrations, activity, and demographics",
    color: "from-violet-500 to-purple-600",
  },
  {
    key: "repositories",
    label: "Repository Report",
    icon: FolderGit2,
    description: "Repository statistics, indexing status, and storage",
    color: "from-cyan-500 to-blue-600",
  },
  {
    key: "ai",
    label: "AI Usage Report",
    icon: Bot,
    description: "AI model usage, token consumption, and performance",
    color: "from-emerald-500 to-teal-600",
  },
  {
    key: "security",
    label: "Security Report",
    icon: Shield,
    description: "Login activity, failed attempts, and security events",
    color: "from-amber-500 to-orange-600",
  },
  {
    key: "activity",
    label: "Activity Report",
    icon: Activity,
    description: "Platform usage trends and engagement metrics",
    color: "from-rose-500 to-pink-600",
  },
];

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "");
          return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(data: Record<string, unknown>, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [generating, setGenerating] = useState<string | null>(null);

  const handleExport = async (type: string, format: string) => {
    setGenerating(type);
    try {
      const data = await generateReport(type);
      const filename = `${type}-report-${new Date().toISOString().split("T")[0]}`;

      if (format === "CSV") {
        const flatData: Record<string, unknown>[] = [];
        if (type === "users") {
          const d = data as { total: number; newThisMonth: number; byRole: { role: string; _count: number }[] };
          flatData.push({ metric: "Total Users", value: d.total });
          flatData.push({ metric: "New This Month", value: d.newThisMonth });
          d.byRole?.forEach((r) => flatData.push({ metric: `Role: ${r.role || "user"}`, value: r._count }));
        } else if (type === "repositories") {
          const d = data as { total: number; newThisMonth: number; totalStorageMB: string };
          flatData.push({ metric: "Total Repos", value: d.total });
          flatData.push({ metric: "New This Month", value: d.newThisMonth });
          flatData.push({ metric: "Total Storage (MB)", value: d.totalStorageMB });
        } else if (type === "ai") {
          const d = data as { conversations: number; messages: number; aiResponses: number; avgMessagesPerConversation: string };
          flatData.push({ metric: "Total Conversations", value: d.conversations });
          flatData.push({ metric: "Total Messages", value: d.messages });
          flatData.push({ metric: "AI Responses", value: d.aiResponses });
          flatData.push({ metric: "Avg Messages/Conversation", value: d.avgMessagesPerConversation });
        } else {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value !== "object") flatData.push({ metric: key, value });
          });
        }
        downloadCSV(flatData, filename);
      } else {
        downloadJSON(data, filename);
      }
      toast.success(`${type} report exported as ${format}`);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setGenerating(null);
    }
  };

  const cardClass = isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Reports</h1>
        <p className={`mt-1 text-[13px] ${textSecondary}`}>
          Generate and export administrative reports
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report, i) => {
          const isThisGenerating = generating === report.key;
          return (
            <motion.div
              key={report.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className={`group relative overflow-hidden rounded-2xl border p-5 transition-all ${cardClass} ${isDark ? "hover:bg-white/[0.04]" : "hover:shadow-lg"}`}
            >
              <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${report.color}`} />

              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${report.color} text-white shadow-lg`}>
                  <report.icon size={18} />
                </div>
                <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1 ${isDark ? "bg-white/[0.04]" : "bg-slate-100"}`}>
                  <FileText size={12} className={isDark ? "text-slate-500" : "text-slate-400"} />
                  <span className={`text-[11px] font-medium ${textMuted}`}>Report</span>
                </div>
              </div>

              <h3 className={`mt-4 text-[15px] font-semibold ${textPrimary}`}>{report.label}</h3>
              <p className={`mt-1.5 text-[13px] leading-relaxed ${textMuted}`}>{report.description}</p>

              <div className="mt-5 flex gap-2">
                {(["CSV", "JSON"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => void handleExport(report.key, fmt)}
                    disabled={isThisGenerating}
                    className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12px] font-medium transition-all ${
                      isDark
                        ? "border-white/[0.06] bg-[#0a0a0f] text-slate-400 hover:bg-white/[0.06] hover:text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    } disabled:opacity-50`}
                  >
                    {isThisGenerating ? (
                      <LoadingIndicator size="sm" />
                    ) : (
                      <Download size={12} />
                    )}
                    {fmt}
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
