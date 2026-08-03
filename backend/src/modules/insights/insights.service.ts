import fs from "fs";
import path from "path";
import { generateAllDocumentation } from "../../services/documentation-generator.service.js";
import { repoFileExists } from "./fs.util.js";
import type {
  ArchitectureResult,
  DependencyGraph,
  HealthScores,
  InsightModule,
  InsightSummary,
  InsightTimeline,
  ProjectInsightsData,
  ProjectInsightsRecord,
  Recommendation,
  TechStackItem,
} from "./types.js";
import type { SecurityFinding } from "../../pipeline/types.js";
import { generateSummary } from "./generators/summary.generator.js";
import { detectModules } from "./generators/modules.generator.js";
import { buildDependencyGraph } from "./generators/dependencies.generator.js";
import { detectTechStack } from "./generators/techstack.generator.js";
import { buildTimeline } from "./generators/timeline.generator.js";
import { generateOverviewText } from "./generators/overview.generator.js";
import { generateArchitecture } from "./generators/architecture.generator.js";
import { generateRecommendations } from "./generators/recommendations.generator.js";
import {
  buildDocHealthFromSources,
  computeHealth,
  type CodeReviewHealthSource,
  type DocHealthSource,
  type PerfHealthSource,
  type SecurityHealthSource,
} from "./generators/health.generator.js";
import {
  createInsightReport,
  getLatestCodeReview,
  getLatestDocumentation,
  getLatestPerfRun,
  getLatestSecurityScan,
  getProjectInsights,
  getRepositoryOwner,
  getRepositoryWithFiles,
  upsertProjectInsights,
} from "./insights.repository.js";
import { buildMarkdownReport } from "./export/markdown.export.js";
import { writePdfReport } from "./export/pdf.export.js";

export type ExportFormat = "markdown" | "pdf";

const readmeExists = (localPath: string | null): boolean => {
  if (!localPath) return false;
  return (
    repoFileExists(localPath, "README.md") ||
    repoFileExists(localPath, "readme.md") ||
    repoFileExists(localPath, "README.MD")
  );
};

const computeDocHealthSource = (localPath: string | null): DocHealthSource | null => {
  if (!localPath) return null;
  try {
    const docs = generateAllDocumentation(localPath);
    return buildDocHealthFromSources({
      readme: readmeExists(localPath),
      totalEndpoints: docs.apiDocs.totalEndpoints,
      functionCount: docs.functionDocs.length,
      classCount: docs.classDocs.length,
      moduleCount: docs.architecture.modules.length,
    });
  } catch {
    return null;
  }
};

export const generateInsights = async (repositoryId: string) => {
  const repo = await getRepositoryWithFiles(repositoryId);
  if (!repo) throw new Error("Repository not found");

  const files = repo.files.map((f) => ({
    path: f.path,
    extension: f.extension,
    size: f.size,
  }));

  const modules = detectModules({ localPath: repo.localPath, files });
  const summary = generateSummary({
    name: repo.name,
    description: undefined,
    localPath: repo.localPath,
    files,
    moduleCount: modules.length,
  });
  let techStack = detectTechStack({ localPath: repo.localPath, files });
  if (summary.primaryLanguage !== "Unknown" && !techStack.some((t) => t.category === "language")) {
    techStack = [{ name: summary.primaryLanguage, category: "language" }, ...techStack];
  }

  const [overview, architecture, timeline, sources] = await Promise.all([
    generateOverviewText(summary, modules),
    generateArchitecture({ localPath: repo.localPath, files, modules, techStack }),
    buildTimeline({
      localPath: repo.localPath,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      moduleFolders: modules.map((m) => m.path),
    }),
    Promise.all([
      getLatestDocumentation(repositoryId),
      getLatestSecurityScan(repositoryId),
      getLatestPerfRun(repositoryId),
      getLatestCodeReview(repositoryId),
    ]),
  ]);

  const [latestDoc, securityScan, perfRun, latestCodeReview] = sources;

  const docHealthSource = computeDocHealthSource(repo.localPath);
  const securitySource: SecurityHealthSource | null = securityScan
    ? {
        findings: (securityScan.findings as unknown as SecurityFinding[]) ?? [],
        blocked: securityScan.blocked,
        status: securityScan.status,
      }
    : null;
  const perfSource: PerfHealthSource | null = perfRun
    ? {
        comparisons: perfRun.comparisons.map((c) => ({
          metric: c.metric,
          beforeValue: c.beforeValue,
          afterValue: c.afterValue,
          pctChange: c.pctChange,
          flagged: c.flagged,
        })),
      }
    : null;
  const codeReviewSource: CodeReviewHealthSource | null = latestCodeReview
    ? {
        issuesFound: latestCodeReview.issuesFound,
        criticalCount: latestCodeReview.criticalCount,
        warningCount: latestCodeReview.warningCount,
        infoCount: latestCodeReview.infoCount,
      }
    : null;

  const health = computeHealth({
    docs: docHealthSource,
    security: securitySource,
    perf: perfSource,
    codeReview: codeReviewSource,
  });

  const recommendations = await generateRecommendations({
    security: securitySource,
    perf: perfSource,
    codeReview: codeReviewSource,
    docHealth: docHealthSource,
  });

  const dependencies = buildDependencyGraph(modules);

  const data: ProjectInsightsData & HealthScores = {
    summary,
    overview,
    architecture,
    modules,
    dependencies,
    techStack,
    timeline,
    recommendations,
    docHealth: health.docHealth,
    securityHealth: health.securityHealth,
    performanceHealth: health.performanceHealth,
    maintainabilityHealth: health.maintainabilityHealth,
    overallHealth: health.overallHealth,
  };

  return upsertProjectInsights(repositoryId, data);
};

type InsightsRow = NonNullable<Awaited<ReturnType<typeof getProjectInsights>>>;

const serializeInsights = (row: InsightsRow): ProjectInsightsRecord => ({
  id: row.id,
  repositoryId: row.repositoryId,
  summary: row.summary as unknown as InsightSummary,
  overview: row.overview,
  architecture: row.architecture as unknown as ArchitectureResult,
  modules: row.modules as unknown as InsightModule[],
  dependencies: row.dependencies as unknown as DependencyGraph,
  techStack: row.techStack as unknown as TechStackItem[],
  timeline: row.timeline as unknown as InsightTimeline,
  recommendations: row.recommendations as unknown as Recommendation[],
  docHealth: row.docHealth,
  securityHealth: row.securityHealth,
  performanceHealth: row.performanceHealth,
  maintainabilityHealth: row.maintainabilityHealth,
  overallHealth: row.overallHealth,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  reports: (row.reports ?? []).map((r) => ({
    id: r.id,
    format: r.format,
    filename: r.filename,
    size: Number(r.size),
    createdAt: r.createdAt.toISOString(),
  })),
});

export const getInsightsForUser = async (
  repositoryId: string,
  userId: string
): Promise<ProjectInsightsRecord> => {
  const repo = await getRepositoryOwner(repositoryId, userId);
  if (!repo) throw new Error("Repository not found");

  let row = await getProjectInsights(repositoryId);
  if (!row) {
    await generateInsights(repositoryId);
    row = await getProjectInsights(repositoryId);
  }
  if (!row) throw new Error("Failed to generate insights");

  const [latestDoc, securityScan, perfRun, codeReview] = await Promise.all([
    getLatestDocumentation(repositoryId),
    getLatestSecurityScan(repositoryId),
    getLatestPerfRun(repositoryId),
    getLatestCodeReview(repositoryId),
  ]);

  const sourceDates = [
    latestDoc?.createdAt,
    securityScan?.createdAt,
    perfRun?.createdAt,
    codeReview?.createdAt,
    repo.updatedAt,
  ].filter((d): d is Date => !!d);

  const stale = sourceDates.some((d) => row.updatedAt < d);

  return { ...serializeInsights(row), stale };
};

export const exportInsights = async (
  repositoryId: string,
  userId: string,
  format: ExportFormat
) => {
  const insights = await getInsightsForUser(repositoryId, userId);

  const dir = path.resolve(process.cwd(), "storage", "insights");
  await fs.promises.mkdir(dir, { recursive: true });

  const slug = insights.summary.name.replace(/[^a-z0-9-_]+/gi, "_").toLowerCase();
  const filename = format === "pdf" ? `${slug}-insights.pdf` : `${slug}-insights.md`;
  const reportPath = path.join(dir, filename);

  if (format === "pdf") {
    await writePdfReport(insights, reportPath);
  } else {
    await fs.promises.writeFile(reportPath, buildMarkdownReport(insights), "utf8");
  }

  const stat = await fs.promises.stat(reportPath);

  const row = await createInsightReport({
    projectInsightsId: insights.id,
    format,
    filename,
    reportPath,
    size: stat.size,
  });

  return {
    id: row.id,
    format: row.format,
    filename: row.filename,
    size: Number(row.size),
    createdAt: row.createdAt.toISOString(),
  };
};
