import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import BackButton from "@/components/common/BackButton";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import FolderVisualization from "@/components/repository/intelligence/FolderVisualization";
import LanguageStatistics from "@/components/repository/intelligence/LanguageStatistics";
import ComplexityAnalysis from "@/components/repository/intelligence/ComplexityAnalysis";
import ImportGraph from "@/components/repository/intelligence/ImportGraph";
import CallGraph from "@/components/repository/intelligence/CallGraph";
import ArchitectureDiagram from "@/components/repository/intelligence/ArchitectureDiagram";
import { FolderTree, BarChart3, Activity, GitBranch, Phone, LayoutGrid } from "lucide-react";

type Tab = "overview" | "folders" | "languages" | "complexity" | "imports" | "calls" | "architecture";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <LayoutGrid size={14} /> },
  { key: "folders", label: "Folders", icon: <FolderTree size={14} /> },
  { key: "languages", label: "Languages", icon: <BarChart3 size={14} /> },
  { key: "complexity", label: "Complexity", icon: <Activity size={14} /> },
  { key: "imports", label: "Import Graph", icon: <GitBranch size={14} /> },
  { key: "calls", label: "Call Graph", icon: <Phone size={14} /> },
  { key: "architecture", label: "Architecture", icon: <LayoutGrid size={14} /> },
];

export default function RepositoryIntelligencePage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!id) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BackButton />
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Repository Intelligence
          </h1>
          <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Interactive visualization and understanding of your codebase.
          </p>
        </div>
        <RepositoryTabs repositoryId={id} />

        <div className={`flex flex-wrap gap-2 rounded-xl border p-2 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[var(--accent)] text-white"
                  : isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Language Distribution</h2>
              <LanguageStatistics repositoryId={id} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Code Complexity</h2>
              <ComplexityAnalysis repositoryId={id} />
            </div>
          </div>
        )}
        {activeTab === "folders" && <FolderVisualization repositoryId={id} />}
        {activeTab === "languages" && <LanguageStatistics repositoryId={id} />}
        {activeTab === "complexity" && <ComplexityAnalysis repositoryId={id} />}
        {activeTab === "imports" && <ImportGraph repositoryId={id} />}
        {activeTab === "calls" && <CallGraph repositoryId={id} />}
        {activeTab === "architecture" && <ArchitectureDiagram repositoryId={id} />}
      </div>
    </DashboardLayout>
  );
}
