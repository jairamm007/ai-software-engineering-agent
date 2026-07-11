import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";

export default function RepositoryReviewPage() {
  return (
    <DashboardLayout>
      <BackButton />

      <h1 className="text-3xl font-bold">
        Repository Review
      </h1>
    </DashboardLayout>
  );
}
