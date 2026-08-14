import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import BackButton from "@/components/common/BackButton";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import SearchFilters from "@/components/repository/search/SearchFilters";
import SemanticSearchResults from "@/components/repository/search/SemanticSearch";
import FileSearch from "@/components/repository/search/FileSearch";
import FunctionSearch from "@/components/repository/search/FunctionSearch";
import ClassSearch from "@/components/repository/search/ClassSearch";
import NaturalLanguageQuery from "@/components/repository/search/NaturalLanguageQuery";
import { combinedSearch } from "@/services/semanticSearch";
import type { SearchFilters as SearchFiltersType } from "@/services/semanticSearch";
import { Search, FileText, FunctionSquare, Box, Brain } from "lucide-react";
import { LoadingIndicator } from "@/components/LoadingIndicator";

type Tab = "all" | "semantic" | "files" | "functions" | "classes";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All Results", icon: <Search size={14} /> },
  { key: "semantic", label: "Semantic", icon: <Brain size={14} /> },
  { key: "files", label: "Files", icon: <FileText size={14} /> },
  { key: "functions", label: "Functions", icon: <FunctionSquare size={14} /> },
  { key: "classes", label: "Classes", icon: <Box size={14} /> },
];

export default function RepositorySemanticSearchPage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["semantic-search", id, query, filters],
    queryFn: () => combinedSearch(id!, query, filters),
    enabled: false,
  });

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setHasSearched(true);
    refetch();
  }, [refetch]);

  const handleFilterChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    if (hasSearched) {
      setTimeout(() => refetch(), 0);
    }
  }, [hasSearched, refetch]);

  if (!id) return null;

  const getTabCount = (tab: Tab): number => {
    if (!data) return 0;
    if (tab === "all") return data.totalResults;
    return data[tab]?.length ?? 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BackButton />
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Semantic Search
          </h1>
          <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Search your codebase using natural language, file patterns, and code structure.
          </p>
        </motion.div>
        <RepositoryTabs repositoryId={id} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <NaturalLanguageQuery onSearch={handleSearch} isLoading={isLoading} />
          <SearchFilters filters={filters} onFiltersChange={handleFilterChange} />
        </motion.div>

        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-wrap gap-2 overflow-hidden rounded-xl border p-2 ${isDark ? "border-white/10 bg-[var(--bg-secondary)]" : "border-slate-200 bg-white"}`}
          >
            {TABS.map((tab) => {
              const count = getTabCount(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeTab === tab.key
                        ? "bg-white/20 text-white"
                        : isDark ? "bg-white/10 text-slate-400" : "bg-slate-100 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingIndicator size="md" />
            <span className={`ml-3 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Searching...
            </span>
          </div>
        )}

        {!isLoading && hasSearched && data && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {activeTab === "all" && (
              <>
                {data.semantic.length > 0 && <SemanticSearchResults results={data.semantic} />}
                {data.files.length > 0 && <FileSearch results={data.files} />}
                {data.functions.length > 0 && <FunctionSearch results={data.functions} />}
                {data.classes.length > 0 && <ClassSearch results={data.classes} />}
                {data.totalResults === 0 && (
                  <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
                    <Search size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      No results found for "{query}". Try different keywords or adjust filters.
                    </p>
                  </div>
                )}
              </>
            )}
            {activeTab === "semantic" && <SemanticSearchResults results={data.semantic} />}
            {activeTab === "files" && <FileSearch results={data.files} />}
            {activeTab === "functions" && <FunctionSearch results={data.functions} />}
            {activeTab === "classes" && <ClassSearch results={data.classes} />}
          </motion.div>
        )}

        {!hasSearched && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl border p-12 text-center ${isDark ? "border-white/10 bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}
          >
            <Search size={64} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-200"}`} />
            <h3 className={`mb-2 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Start Searching
            </h3>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Enter a query above to search across your codebase using semantic understanding, file names, functions, and classes.
            </p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
