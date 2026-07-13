import { useParams } from "react-router-dom";
import BackButton from "@/components/common/BackButton";
import DependencyGraph from "@/components/repository/DependencyGraph";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useTheme } from "@/context/ThemeContext";

export default function DependencyGraphPage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!id) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BackButton />
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Dependency Graph
          </h1>
          <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Explore local import relationships across this repository.
          </p>
        </div>
        <RepositoryTabs repositoryId={id} />
        <DependencyGraph repositoryId={id} />
      </div>
    </DashboardLayout>
  );
}
