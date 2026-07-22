import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import BackButton from "@/components/common/BackButton";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import ReadmeGenerator from "@/components/repository/documentation/ReadmeGenerator";
import ApiDocsGenerator from "@/components/repository/documentation/ApiDocsGenerator";
import FunctionClassDocs from "@/components/repository/documentation/FunctionClassDocs";
import ArchitectureDocsGenerator from "@/components/repository/documentation/ArchitectureDocsGenerator";
import { FileText, Code, BookOpen, Layers } from "lucide-react";

type Tab = "readme" | "api" | "functions" | "architecture";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "readme", label: "README", icon: <FileText size={14} /> },
  { key: "api", label: "API Docs", icon: <Code size={14} /> },
  { key: "functions", label: "Functions & Classes", icon: <BookOpen size={14} /> },
  { key: "architecture", label: "Architecture", icon: <Layers size={14} /> },
];

export default function RepositoryDocumentationGeneratorPage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<Tab>("readme");

  if (!id) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BackButton />
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Documentation Generator
          </h1>
          <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            One-click documentation for your entire codebase.
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

        {activeTab === "readme" && <ReadmeGenerator repositoryId={id} />}
        {activeTab === "api" && <ApiDocsGenerator repositoryId={id} />}
        {activeTab === "functions" && <FunctionClassDocs repositoryId={id} />}
        {activeTab === "architecture" && <ArchitectureDocsGenerator repositoryId={id} />}
      </div>
    </DashboardLayout>
  );
}
