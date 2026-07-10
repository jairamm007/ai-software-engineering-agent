import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import DashboardLayout from "@/layouts/DashboardLayout";

import RepositoryForm from "@/components/repository/RepositoryForm";
import RepositoryTable from "@/components/repository/RepositoryTable";

import {
  analyzeRepository,
  getRepositories,
} from "@/services/repository";

export default function RepositoryPage() {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
  } = useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  const mutation = useMutation({
    mutationFn: analyzeRepository,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["repositories"],
      });
    },
  });

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-3xl font-bold">
        Repository Management
      </h1>

      <RepositoryForm
        onSubmit={(url) =>
          mutation.mutateAsync(url)
        }
      />

      {isLoading ? (
        <p>Loading repositories...</p>
      ) : (
        <RepositoryTable
          repositories={data}
        />
      )}
    </DashboardLayout>
  );
}