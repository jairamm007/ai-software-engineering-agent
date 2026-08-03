import { prisma } from "../../database/prisma.js";
import type { Prisma } from "@prisma/client";
import type { HealthScores, ProjectInsightsData } from "./types.js";

type UpsertData = ProjectInsightsData & HealthScores;

const toDbPayload = (data: UpsertData) => ({
  summary: data.summary as unknown as Prisma.InputJsonValue,
  overview: data.overview,
  architecture: data.architecture as unknown as Prisma.InputJsonValue,
  modules: data.modules as unknown as Prisma.InputJsonValue,
  dependencies: data.dependencies as unknown as Prisma.InputJsonValue,
  techStack: data.techStack as unknown as Prisma.InputJsonValue,
  timeline: data.timeline as unknown as Prisma.InputJsonValue,
  recommendations: data.recommendations as unknown as Prisma.InputJsonValue,
  docHealth: data.docHealth,
  securityHealth: data.securityHealth,
  performanceHealth: data.performanceHealth,
  maintainabilityHealth: data.maintainabilityHealth,
  overallHealth: data.overallHealth,
});

export const getRepositoryWithFiles = (repositoryId: string) =>
  prisma.repository.findUnique({
    where: { id: repositoryId },
    include: {
      files: {
        select: { path: true, extension: true, size: true },
      },
    },
  });

export const getRepositoryOwner = (repositoryId: string, userId: string) =>
  prisma.repository.findFirst({
    where: { id: repositoryId, userId },
    select: { id: true, name: true, githubUrl: true, localPath: true, createdAt: true, updatedAt: true },
  });

export const getLatestDocumentation = (repositoryId: string) =>
  prisma.documentation.findFirst({
    where: { repositoryId, status: "completed" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

export const getLatestSecurityScan = (repositoryId: string) =>
  prisma.securityScanResult.findFirst({
    where: {
      status: "done",
      debugRun: { repositoryId, status: "done", stage: "security" },
    },
    orderBy: { createdAt: "desc" },
  });

export const getLatestPerfRun = (repositoryId: string) =>
  prisma.debugRun.findFirst({
    where: { repositoryId, status: "done", stage: "performance" },
    orderBy: { createdAt: "desc" },
    include: {
      baselines: { orderBy: { createdAt: "asc" } },
      comparisons: true,
    },
  });

export const getLatestCodeReview = (repositoryId: string) =>
  prisma.codeReview.findFirst({
    where: { repositoryId, status: "completed" },
    orderBy: { createdAt: "desc" },
  });

export const getProjectInsights = (repositoryId: string) =>
  prisma.projectInsights.findUnique({
    where: { repositoryId },
    include: {
      reports: { orderBy: { createdAt: "desc" } },
    },
  });

export const upsertProjectInsights = (
  repositoryId: string,
  data: UpsertData
) => {
  const payload = toDbPayload(data);
  return prisma.projectInsights.upsert({
    where: { repositoryId },
    create: { repositoryId, ...payload } as Prisma.ProjectInsightsUncheckedCreateInput,
    update: payload as Prisma.ProjectInsightsUncheckedUpdateInput,
  });
};

export const createInsightReport = (input: {
  projectInsightsId: string;
  format: string;
  filename: string;
  reportPath: string;
  size: number;
}) =>
  prisma.insightReport.create({
    data: {
      projectInsightsId: input.projectInsightsId,
      format: input.format,
      filename: input.filename,
      reportPath: input.reportPath,
      size: BigInt(input.size),
    },
  });

export const getInsightReport = (reportId: string) =>
  prisma.insightReport.findUnique({
    where: { id: reportId },
    include: {
      projectInsights: { include: { repository: { select: { userId: true } } } },
    },
  });
