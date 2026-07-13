import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";
import { useTheme } from "@/context/ThemeContext";

export default function RepositoryOverviewPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DashboardLayout>
      <BackButton />
      <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
        Repository Overview
      </h1>
    </DashboardLayout>
  );
}
