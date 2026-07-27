import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const tab = searchParams.get("tab");
    return (tab && TABS.some((t) => t.key === tab)) ? tab as Tab : "readme";
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (!id) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "readme":
        return (
          <motion.div
            key="readme"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ReadmeGenerator repositoryId={id} />
          </motion.div>
        );
      case "api":
        return (
          <motion.div
            key="api"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ApiDocsGenerator repositoryId={id} />
          </motion.div>
        );
      case "functions":
        return (
          <motion.div
            key="functions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <FunctionClassDocs repositoryId={id} />
          </motion.div>
        );
      case "architecture":
        return (
          <motion.div
            key="architecture"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ArchitectureDocsGenerator repositoryId={id} />
          </motion.div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BackButton />
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Documentation Generator
            </h1>
            <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              One-click documentation for your entire codebase.
            </p>
          </div>
        </div>
        <RepositoryTabs repositoryId={id} />

        <div className={`flex flex-wrap items-center gap-2 overflow-hidden rounded-xl border p-2 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
