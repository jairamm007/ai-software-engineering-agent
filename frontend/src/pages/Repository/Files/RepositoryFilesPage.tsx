import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BackButton from "@/components/common/BackButton";
import FileExplorer from "@/components/repository/FileExplorer";
import FileViewer from "@/components/repository/FileViewer";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getRepository } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import type { RepositoryFile } from "@/types/repository";

export default function RepositoryFilesPage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [searchParams] = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const repositoryQuery = useQuery({
    queryKey: ["repository", id],
    queryFn: () => getRepository(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    const requestedFileId = searchParams.get("file");
    const files = repositoryQuery.data?.files;
    if (!files?.length) return;
    setSelectedFile(files.find((file) => file.id === requestedFileId) ?? files[0]);
  }, [repositoryQuery.data?.files, searchParams]);

  if (!id) return null;
  if (repositoryQuery.isLoading) return <DashboardLayout><div className={`h-64 animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} /></DashboardLayout>;
  if (repositoryQuery.isError || !repositoryQuery.data) return <DashboardLayout><p className="text-red-600">Failed to load repository files.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BackButton />
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Repository Files</h1>
          <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Browse the indexed source files in this repository.</p>
        </div>
        <RepositoryTabs repositoryId={id} />
        <div className="grid min-w-0 gap-6 overflow-hidden lg:grid-cols-12">
          <aside className="min-w-0 lg:col-span-4">
            <FileExplorer files={repositoryQuery.data.files} selectedFileId={selectedFile?.id} onSelect={setSelectedFile} />
          </aside>
          <section className="min-w-0 overflow-hidden lg:col-span-8">
            <FileViewer filePath={selectedFile?.path} content={selectedFile?.chunks.map((chunk) => chunk.content).join("\n")} />
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
