import { useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ChevronDown, FileText, FileDown, ArrowLeft } from "lucide-react";
import { SparkleLoader } from "@/components/common/SparkleLoader";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import Card from "@/components/ui/Card";
import Badge from "@/components/pipeline/Badge";
import InsightsTabs from "@/components/insights/InsightsTabs";
import { INSIGHT_TABS } from "@/components/insights/insight-tabs";
import OverviewPanel from "@/components/insights/panels/OverviewPanel";
import SummaryPanel from "@/components/insights/panels/SummaryPanel";
import ArchitecturePanel from "@/components/insights/panels/ArchitecturePanel";
import ModulesPanel from "@/components/insights/panels/ModulesPanel";
import DependenciesPanel from "@/components/insights/panels/DependenciesPanel";
import TechStackPanel from "@/components/insights/panels/TechStackPanel";
import TimelinePanel from "@/components/insights/panels/TimelinePanel";
import HealthPanel from "@/components/insights/panels/HealthPanel";
import RecommendationsPanel from "@/components/insights/panels/RecommendationsPanel";
import { getRepository, getRepositories } from "@/services/repository";
import { downloadInsightReport, exportInsights, getInsights, refreshInsights } from "@/services/insights";
import type { InsightSectionKey, ProjectInsights } from "@/types/insights";

const PANELS: Record<InsightSectionKey, (insights: ProjectInsights) => React.ReactNode> = {
  overview: (insights) => <OverviewPanel insights={insights} />,
  summary: (insights) => <SummaryPanel insights={insights} />,
  architecture: (insights) => <ArchitecturePanel insights={insights} />,
  modules: (insights) => <ModulesPanel insights={insights} />,
  dependencies: (insights) => <DependenciesPanel insights={insights} />,
  techstack: (insights) => <TechStackPanel insights={insights} />,
  timeline: (insights) => <TimelinePanel insights={insights} />,
  health: (insights) => <HealthPanel insights={insights} />,
  recommendations: (insights) => <RecommendationsPanel insights={insights} />,
};

export default function InsightsPage() {
  const { repositoryId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [searchParams, setSearchParams] = useSearchParams();
  const [exportOpen, setExportOpen] = useState(false);

  const { data: insights, isPending, isError } = useQuery({
    queryKey: ["insights", repositoryId],
    queryFn: () => getInsights(repositoryId as string),
    enabled: !!repositoryId,
  });

  const { data: repository } = useQuery({
    queryKey: ["repository", repositoryId],
    queryFn: () => getRepository(repositoryId as string),
    enabled: !!repositoryId,
  });

  const { data: repositories, isPending: reposPending } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
    enabled: !repositoryId,
  });

  const refreshMutation = useMutation({
    mutationFn: () => refreshInsights(repositoryId as string),
    onSuccess: (data) => {
      queryClient.setQueryData(["insights", repositoryId], data);
    },
  });

  const exportMutation = useMutation({
    mutationFn: (format: "markdown" | "pdf") => exportInsights(repositoryId as string, format),
    onSuccess: async (report) => {
      await downloadInsightReport(report.id);
      setExportOpen(false);
    },
  });

  const activeTabRaw = searchParams.get("tab");
  const activeTab: InsightSectionKey =
    activeTabRaw && INSIGHT_TABS.some((t) => t.key === activeTabRaw)
      ? (activeTabRaw as InsightSectionKey)
      : "overview";

  const panel = useMemo(() => insights && PANELS[activeTab](insights), [insights, activeTab]);

  const title = repository?.name ?? insights?.summary.name ?? "Project Insights";

  const handleSelectTab = (key: InsightSectionKey) => {
    setSearchParams({ tab: key }, { replace: true });
  };

  if (!repositoryId) {
    return (
      <DashboardLayout>
        <div className="space-y-5">
          <h1 className="text-2xl font-bold">AI Project Insights</h1>
          <p className="text-sm text-slate-500">Select a repository to generate and explore its AI project insights report.</p>
          {reposPending ? (
            <p className="text-sm text-slate-500">Loading repositories…</p>
          ) : repositories && repositories.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {repositories.map((repo) => (
                <button
                  key={repo.id}
                  type="button"
                  onClick={() => navigate(`/insights/${repo.id}`)}
                  className={`rounded-xl border p-4 text-left transition-colors ${isDark ? "border-white/10 bg-[var(--card-bg)] hover:border-[var(--accent)]/50" : "border-slate-200 bg-white hover:border-[var(--accent)]"}`}
                >
                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{repo.name}</p>
                  <p className={`mt-1 truncate text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{repo.githubUrl}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No repositories found. Add a repository from the{" "}
              <button type="button" onClick={() => navigate("/repositories")} className="text-[var(--accent)] hover:underline">
                Repositories
              </button>{" "}
              page first.
            </p>
          )}
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-semibold">Insights not found</p>
          <p className="text-sm text-slate-500">This repository may not exist or you may not have access to it.</p>
          <button
            type="button"
            onClick={() => navigate("/insights")}
            className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Back to insights
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate("/insights")}
          className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft size={14} /> Back to insights
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{title}</h1>
            {insights?.overallHealth !== null && insights?.overallHealth !== undefined && (
              <Badge className="bg-emerald-500/15 text-emerald-500">
                {insights.overallHealth}/100 health
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {insights?.stale && (
              <Badge className="bg-amber-500/15 text-amber-600">
                Source data updated since last refresh
              </Badge>
            )}
            <button
              type="button"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending || isPending}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <SparkleLoader size={14} />
              {refreshMutation.isPending ? "Refreshing…" : "Refresh Insights"}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((open) => !open)}
                disabled={exportMutation.isPending || !insights}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <Download size={14} />
                Export
                <ChevronDown size={14} />
              </button>
              {exportOpen && insights && (
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => exportMutation.mutate("markdown")}
                    disabled={exportMutation.isPending}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <FileText size={14} /> Markdown (.md)
                  </button>
                  <button
                    type="button"
                    onClick={() => exportMutation.mutate("pdf")}
                    disabled={exportMutation.isPending}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <FileDown size={14} /> PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {insights?.stale && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            This report was generated from source data that has since changed. Press “Refresh Insights” to regenerate it.
          </div>
        )}

        <InsightsTabs active={activeTab} onSelect={handleSelectTab} />

        <Card>
          {isPending && !insights ? (
            <p className="text-sm text-slate-500">Generating insights for the first time…</p>
          ) : insights ? (
            panel
          ) : null}
        </Card>
      </div>
    </DashboardLayout>
  );
}
