import { prisma } from "../database/prisma.js";

export interface CreatePerformanceScanInput {
  userId: string;
  repositoryId?: string;
}

export interface CreatePerformanceIssueInput {
  scanId: string;
  filePath?: string;
  issueType: string;
  severity: string;
  title: string;
  description?: string;
  recommendation?: string;
  snippet?: string;
  lineStart?: number;
  lineEnd?: number;
}

export const createPerformanceScan = (input: CreatePerformanceScanInput) =>
  prisma.performanceScan.create({ data: { ...input, status: "running" } });

export const updatePerformanceScan = (
  id: string,
  data: {
    performanceScore?: number;
    maintainabilityScore?: number;
    readabilityScore?: number;
    overallHealth?: number;
    filesAnalyzed?: number;
    summary?: string;
    status?: string;
    updatedAt: Date;
  }
) => prisma.performanceScan.update({ where: { id }, data });

export const getPerformanceScanById = (id: string, userId: string) =>
  prisma.performanceScan.findFirst({
    where: { id, userId },
    include: { issues: { orderBy: { createdAt: "desc" } }, reports: true },
  });

export const getPerformanceScans = (
  userId: string,
  options: { page: number; limit: number }
) => {
  const { page, limit } = options;
  const where = { userId };

  return prisma.$transaction([
    prisma.performanceScan.count({ where }),
    prisma.performanceScan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { issues: true },
    }),
  ]);
};

export const createPerformanceIssues = (inputs: CreatePerformanceIssueInput[]) =>
  prisma.performanceIssue.createMany({ data: inputs });

export const getIssuesByScan = (scanId: string) =>
  prisma.performanceIssue.findMany({
    where: { scanId },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  });

export const getIssuesByRepository = (repositoryId: string, userId: string) =>
  prisma.performanceIssue.findMany({
    where: { scan: { repositoryId, userId } },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    include: { scan: { select: { repositoryId: true } } },
  });

export const createPerformanceReport = (
  scanId: string,
  content: string,
  format: string
) =>
  prisma.performanceReport.create({ data: { scanId, content, format } });

export const getReportById = (id: string) =>
  prisma.performanceReport.findUnique({ where: { id }, include: { scan: true } });
