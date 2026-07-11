import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";

export default function RepositoryArchitecturePage() {
  return (
    <DashboardLayout>
      <BackButton />

      <h1 className="text-3xl font-bold">
        Repository Architecture
      </h1>
    </DashboardLayout>
  );
}
