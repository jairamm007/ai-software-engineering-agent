import { useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import DashboardLayout from "@/layouts/DashboardLayout";

import RepositoryTabs from "@/components/repository/RepositoryTabs";
import RepositoryOverview from "@/components/repository/RepositoryOverview";

import { getRepository } from "@/services/repository";

export default function RepositoryDetailsPage() {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["repository", id],
    queryFn: () => getRepository(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg font-medium">
            Loading repository...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-red-600">
            Repository not found.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">
            {data.name}
          </h1>

          <p className="mt-2 text-slate-500 break-all">
            {data.githubUrl}
          </p>
        </div>

        {/* Navigation Tabs */}
        <RepositoryTabs
          repositoryId={data.id}
        />

        {/* Statistics */}
        <RepositoryOverview
          repository={data}
        />
      </div>
    </DashboardLayout>
  );
}