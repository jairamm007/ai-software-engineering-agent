import { useQuery } from "@tanstack/react-query";
import AnalyticsCard from "@/components/repository/AnalyticsCard";
import { getRepositoryAnalytics } from "@/services/analytics";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  repositoryId: string;
}

const formatBytes = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function RepositoryAnalytics({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["repository-analytics", repositoryId],
    queryFn: () => getRepositoryAnalytics(repositoryId),
  });

  if (isLoading) return <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading analytics...</p>;
  if (isError || !data) return <p className="text-sm text-red-600">Failed to load analytics.</p>;

  return (
    <section className={`space-y-5 rounded-2xl border p-6 shadow-sm ${
      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
    }`}>
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Repository Analytics</h2>
        <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Index coverage and codebase composition.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard icon="📄" label="Files" value={data.totalFiles} />
        <AnalyticsCard icon="📦" label="Chunks" value={data.totalChunks} />
        <AnalyticsCard icon="📂" label="Folders" value={data.totalFolders} />
        <AnalyticsCard icon="🧠" label="Embeddings" value={data.vectorEmbeddings} />
        <AnalyticsCard icon="📏" label="Average File Size" value={formatBytes(data.averageFileSize)} />
        <AnalyticsCard icon="📈" label="Repository Health" value={`${data.healthScore}%`} />
        <AnalyticsCard icon="✅" label="AI Indexed" value={`${data.indexedPercentage}%`} />
        <AnalyticsCard icon="🧩" label="Chunks per File" value={data.averageChunksPerFile} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`rounded-xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>💻 Languages</h3>
          <div className="mt-4 space-y-3">
            {data.languages.map((language) => (
              <div key={language.name}>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? "text-slate-300" : "text-slate-700"}>{language.name}</span>
                  <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>{language.percentage}%</span>
                </div>
                <div className={`mt-1 h-2 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${language.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>File Size</h3>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className={isDark ? "text-slate-400" : "text-slate-500"}>Largest File</dt>
              <dd className={`text-right font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                {data.largestFile ? `${data.largestFile.path} (${formatBytes(data.largestFile.size)})` : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={isDark ? "text-slate-400" : "text-slate-500"}>Smallest File</dt>
              <dd className={`text-right font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                {data.smallestFile ? `${data.smallestFile.path} (${formatBytes(data.smallestFile.size)})` : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={isDark ? "text-slate-400" : "text-slate-500"}>Total Size</dt>
              <dd className={`font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{formatBytes(data.totalSize)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
