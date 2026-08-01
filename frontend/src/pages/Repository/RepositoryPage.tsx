import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ArrowUpDown, FolderGit2 } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import RepositoryForm from "@/components/repository/RepositoryForm";
import RepositoryTable from "@/components/repository/RepositoryTable";
import { analyzeRepository, getRepositories } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import type { RepositoryListItem } from "@/types/repository";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name A-Z" },
  { value: "files", label: "Most Files" },
];

export default function RepositoryPage() {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  const { data = [], isLoading } = useQuery<RepositoryListItem[]>({
    queryKey: ["repositories", { search: debouncedSearch, sortBy }],
    queryFn: () => getRepositories({ search: debouncedSearch, sortBy }),
  });

  const mutation = useMutation({
    mutationFn: analyzeRepository,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient shadow-lg accent-shadow">
            <FolderGit2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
              Repositories
            </h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Manage and analyze your GitHub repositories
            </p>
          </div>
        </div>
      <RepositoryForm
        onSubmit={(url) => mutation.mutateAsync(url)}
      />
      {mutation.isPending && (
        <div className={`mb-4 flex items-center gap-3 rounded-xl border p-4 ${
          isDark ? "border-violet-500/20 bg-violet-500/5" : "border-violet-200 bg-violet-50"
        }`}>
          <LoadingIndicator size="sm" />
          <div>
            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
              Cloning & indexing repository...
            </p>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              This may take a few minutes depending on repository size
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors ${
              isDark
                ? "border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-500"
                : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
            }`}
          />
        </div>
        <div className="relative shrink-0">
          <ArrowUpDown size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`w-full appearance-none rounded-lg border py-2 pl-8 pr-8 text-sm outline-none cursor-pointer transition-colors sm:w-auto ${
              isDark
                ? "border-white/20 bg-white/5 text-white focus:border-violet-500"
                : "border-slate-300 bg-white text-slate-900 focus:border-violet-500"
            }`}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isLoading ? (
        <LoadingIndicator size="md" label="Loading repositories" />
      ) : (
        <RepositoryTable repositories={data} />
      )}
      </div>
    </DashboardLayout>
  );
}
