import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";
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
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <GitBranch size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Dependency Graph
            </h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Explore local import relationships across this repository
            </p>
          </div>
        </motion.div>
        <RepositoryTabs repositoryId={id} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <DependencyGraph repositoryId={id} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
