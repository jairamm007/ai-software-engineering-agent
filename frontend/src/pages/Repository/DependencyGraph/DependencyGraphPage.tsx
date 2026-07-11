import { useParams } from "react-router-dom";

import BackButton from "@/components/common/BackButton";
import DependencyGraph from "@/components/repository/DependencyGraph";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function DependencyGraphPage() {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold">Dependency Graph</h1>
          <p className="mt-2 text-slate-500">
            Explore local import relationships across this repository.
          </p>
        </div>
        <RepositoryTabs repositoryId={id} />
        <DependencyGraph repositoryId={id} />
      </div>
    </DashboardLayout>
  );
}
