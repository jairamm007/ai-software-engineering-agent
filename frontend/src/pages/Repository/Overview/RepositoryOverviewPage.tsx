import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";

export default function RepositoryOverviewPage() {
  return (
    <DashboardLayout>
      <BackButton />

      <h1 className="text-3xl font-bold">
        Repository Overview
      </h1>
    </DashboardLayout>
  );
}
