import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";

export default function RepositoryDocumentationPage() {
  return (
    <DashboardLayout>
      <BackButton />

      <h1 className="text-3xl font-bold">
        Repository Documentation
      </h1>
    </DashboardLayout>
  );
}
