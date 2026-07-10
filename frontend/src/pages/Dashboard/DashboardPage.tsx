import { useQuery } from "@tanstack/react-query";

import DashboardLayout from "@/layouts/DashboardLayout";
import StatCard from "@/components/cards/StatCard";

import { getRepositories } from "@/services/repository";

export default function DashboardPage() {
  const { data = [] } = useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  const totalRepositories = data.length;

  const totalFiles = data.reduce(
    (sum: number, repository: any) =>
      sum + repository.files.length,
    0
  );

  const totalChunks = data.reduce(
    (sum: number, repository: any) =>
      sum +
      repository.files.reduce(
        (chunkSum: number, file: any) =>
          chunkSum + file.chunks.length,
        0
      ),
    0
  );

  return (
    <DashboardLayout>
      <h1
        style={{
          fontSize: 32,
          marginBottom: 30,
        }}
      >
        Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: 20,
        }}
      >
        <StatCard
          title="Repositories"
          value={totalRepositories}
        />

        <StatCard
          title="Files"
          value={totalFiles}
        />

        <StatCard
          title="Chunks"
          value={totalChunks}
        />

        <StatCard
          title="AI Providers"
          value={4}
        />
      </div>
    </DashboardLayout>
  );
}