import {
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import DashboardLayout from "@/layouts/DashboardLayout";
import RepositoryWorkspaceLayout from "@/layouts/RepositoryWorkspaceLayout";

import RepositoryTabs from "@/components/repository/RepositoryTabs";
import FileExplorer from "@/components/repository/FileExplorer";
import FileViewer from "@/components/repository/FileViewer";
import RepositoryOverview from "@/components/repository/RepositoryOverview";

import { getRepository } from "@/services/repository";

import type { RepositoryFile } from "@/types/repository";

export default function RepositoryDetailsPage() {
  const { id } = useParams();
  const [selectedFile, setSelectedFile] =
    useState<RepositoryFile | null>(null);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["repository", id],
    queryFn: () => getRepository(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data && data.files.length > 0 && !selectedFile) {
      setSelectedFile(data.files[0]);
    }
  }, [data, selectedFile]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg font-medium">
            Loading repository...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-red-600">
            Repository not found.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            {data.name}
          </h1>

          <p className="mt-2 break-all text-slate-500">
            {data.githubUrl}
          </p>
        </div>

        <RepositoryTabs
          repositoryId={data.id}
        />

        <RepositoryWorkspaceLayout
          sidebar={
            <FileExplorer
              files={data.files}
              selectedFileId={selectedFile?.id}
              onSelect={setSelectedFile}
            />
          }
          content={
            <>
            <RepositoryOverview
              repository={data}
            />

            <FileViewer
              filePath={selectedFile?.path}
              content={selectedFile?.chunks
                .map((chunk) => chunk.content)
                .join("\n\n")}
            />
            </>
          }
        />
      </div>
    </DashboardLayout>
  );
}