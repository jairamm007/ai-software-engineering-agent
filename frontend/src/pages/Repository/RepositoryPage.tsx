import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import RepositoryForm from "@/components/repository/RepositoryForm";
import RepositoryTable from "@/components/repository/RepositoryTable";
import { analyzeRepository, getRepositories } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import type { RepositoryListItem } from "@/types/repository";

export default function RepositoryPage() {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data = [], isLoading } = useQuery<RepositoryListItem[]>({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  const mutation = useMutation({
    mutationFn: analyzeRepository,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
  });

  return (
    <DashboardLayout>
      <h1 className={`mb-6 text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
        Repository Management
      </h1>
      <RepositoryForm onSubmit={(url) => mutation.mutateAsync(url)} />
      {isLoading ? (
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>Loading repositories...</p>
      ) : (
        <RepositoryTable repositories={data} />
      )}
    </DashboardLayout>
  );
}
