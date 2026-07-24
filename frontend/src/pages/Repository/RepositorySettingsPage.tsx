import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, RefreshCw, Settings, ExternalLink } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";
import { getRepository, deleteRepository, reindexRepository } from "@/services/repository";

export default function RepositorySettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReindexConfirm, setShowReindexConfirm] = useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["repository", id],
    queryFn: () => getRepository(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRepository(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      navigate("/repositories");
    },
  });

  const reindexMutation = useMutation({
    mutationFn: () => reindexRepository(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repository", id] });
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      setShowReindexConfirm(false);
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
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

  const totalChunks = data.files.reduce((acc, file) => acc + file.chunks.length, 0);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        <BackButton />

        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "var(--accent-light)" }}
          >
            <Settings size={20} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
              Repository Settings
            </h1>
            <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Manage and configure your repository
            </p>
          </div>
        </div>

        <div
          className={`rounded-2xl border shadow-sm overflow-hidden ${
            isDark
              ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
              Repository Information
            </h2>
          </div>
          <div className="space-y-0 divide-y divide-white/5">
            {[
              { label: "Name", value: data.name },
              { label: "GitHub URL", value: data.githubUrl, link: data.githubUrl },
              { label: "Local Path", value: data.localPath },
              { label: "Created", value: new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
              { label: "Files", value: `${data.files.length} files` },
              { label: "Chunks", value: `${totalChunks} chunks` },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex min-w-0 items-center justify-between gap-4 px-5 py-3.5 ${
                  isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"
                }`}
              >
                <span className={`shrink-0 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {item.label}
                </span>
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: "var(--accent)" }}
                  >
                    <span className="truncate">{item.value}</span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                ) : (
                  <span className={`min-w-0 truncate text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-2xl border shadow-sm overflow-hidden ${
            isDark
              ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
              Actions
            </h2>
          </div>
          <div className="space-y-3 p-5">
            <div
              className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <RefreshCw size={16} className="shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    Re-index Repository
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Re-scan and re-index all files in this repository
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReindexConfirm(true)}
                disabled={reindexMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 disabled:opacity-50"
              >
                {reindexMutation.isPending ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                {reindexMutation.isPending ? "Re-indexing..." : "Re-index"}
              </button>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                isDark ? "border-red-500/10 bg-red-500/5" : "border-red-100 bg-red-50/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Trash2 size={16} className="shrink-0 text-red-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-red-600">Delete Repository</p>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      Permanently remove this repository and all its data
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? (
                    <Trash2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}
          >
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Delete Repository
            </h3>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Are you sure you want to delete &quot;{data.name}&quot;? This will permanently remove all files, chunks, and analysis data. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Repository"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReindexConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowReindexConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}
          >
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Re-index Repository
            </h3>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              This will re-scan and re-index all files in &quot;{data.name}&quot;. Existing analysis data may be updated.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReindexConfirm(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => reindexMutation.mutate()}
                disabled={reindexMutation.isPending}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {reindexMutation.isPending ? "Re-indexing..." : "Re-index"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
