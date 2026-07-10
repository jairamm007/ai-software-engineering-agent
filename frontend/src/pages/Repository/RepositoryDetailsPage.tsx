import { useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import DashboardLayout from "@/layouts/DashboardLayout";

import { getRepository } from "@/services/repository";

export default function RepositoryDetailsPage() {
  const { id } = useParams();

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: [
      "repository",
      id,
    ],

    queryFn: () =>
      getRepository(id!),

    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        Loading...
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        Repository not found
      </DashboardLayout>
    );
  }

  const totalChunks =
    data.files.reduce(
      (sum, file) =>
        sum + file.chunks.length,
      0
    );

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-3xl font-bold">
        {data.name}
      </h1>

      <div className="space-y-3">

        <p>
          <strong>GitHub:</strong>
          {" "}
          {data.githubUrl}
        </p>

        <p>
          <strong>Files:</strong>
          {" "}
          {data.files.length}
        </p>

        <p>
          <strong>Chunks:</strong>
          {" "}
          {totalChunks}
        </p>

        <p>
          <strong>Created:</strong>
          {" "}
          {new Date(
            data.createdAt
          ).toLocaleString()}
        </p>

      </div>
    </DashboardLayout>
  );
}