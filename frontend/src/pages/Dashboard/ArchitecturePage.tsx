import { motion } from "framer-motion";
import { Layers, Boxes, ArrowRight, GitBranch, Database, Globe } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";

const layers = [
  { icon: Globe, name: "Frontend", tech: "React 19 + Vite", files: 87, color: "violet" },
  { icon: Database, name: "Backend", tech: "Express 5 + Prisma", files: 64, color: "fuchsia" },
  { icon: GitBranch, name: "Shared", tech: "TypeScript Types", files: 12, color: "cyan" },
];

const connections = [
  { from: "Frontend", to: "Backend", label: "REST API / WebSocket", strength: 95 },
  { from: "Backend", to: "Database", label: "Prisma ORM", strength: 100 },
  { from: "Frontend", to: "Shared", label: "Type Imports", strength: 80 },
];

export default function ArchitecturePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Select a repository to view its architecture diagram and dependency graph.
          </p>
        </motion.div>

        {/* Architecture Layers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid gap-4 sm:grid-cols-3">
          {layers.map((layer, i) => (
            <motion.div key={layer.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }} whileHover={{ y: -4 }} className={`rounded-2xl border p-6 transition-shadow ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:shadow-violet-500/5" : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"}`}>
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-${layer.color}-500/10`}>
                <layer.icon size={20} className={`text-${layer.color}-500`} />
              </div>
              <h3 className={`font-[Outfit] text-base font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>{layer.name}</h3>
              <p className={`text-xs font-[Inter] mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{layer.tech}</p>
              <p className={`text-xs font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{layer.files} files</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Connections */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <h2 className={`font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Module Connections</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {connections.map((conn, i) => (
              <motion.div key={`${conn.from}-${conn.to}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.05 }} className="flex items-center gap-4 px-6 py-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>{conn.from}</span>
                  <ArrowRight size={12} className={`shrink-0 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                  <span className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>{conn.to}</span>
                </div>
                <span className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{conn.label}</span>
                <div className="ml-auto flex items-center gap-2">
                  <div className={`h-1.5 w-20 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${conn.strength}%` }} transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                  </div>
                  <span className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{conn.strength}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
