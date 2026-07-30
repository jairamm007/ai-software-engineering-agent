import { prisma } from "../database/prisma.js";

export interface CreateSecurityScanInput {
  userId: string;
  repositoryId?: string;
}

export interface CreateSecurityIssueInput {
  scanId: string;
  filePath?: string;
  issueType: string;
  severity: string;
  title: string;
  description?: string;
  recommendation?: string;
  snippet?: string;
}

export const createSecurityScan = (input: CreateSecurityScanInput) =>
  prisma.securityScan.create({ data: { ...input, status: "running" } });

export const updateSecurityScan = (
  id: string,
  data: { securityScore?: number; summary?: string; status?: string; updatedAt: Date }
) => prisma.securityScan.update({ where: { id }, data });

export const getSecurityScanById = (id: string, userId: string) =>
  prisma.securityScan.findFirst({
    where: { id, userId },
    include: { issues: { orderBy: { createdAt: "desc" } }, reports: true },
  });

export const getSecurityScans = (
  userId: string,
  options: { page: number; limit: number }
) => {
  const { page, limit } = options;
  const where = { userId };

  return prisma.$transaction([
    prisma.securityScan.count({ where }),
    prisma.securityScan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { issues: true },
    }),
  ]);
};

export const createSecurityIssue = (input: CreateSecurityIssueInput) =>
  prisma.securityIssue.create({ data: input });

export const createSecurityIssues = (inputs: CreateSecurityIssueInput[]) =>
  prisma.securityIssue.createMany({ data: inputs });

export const getIssuesByScan = (scanId: string) =>
  prisma.securityIssue.findMany({
    where: { scanId },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  });

export const getIssuesByRepository = (repositoryId: string, userId: string) =>
  prisma.securityIssue.findMany({
    where: {
      scan: { repositoryId, userId },
    },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    include: { scan: { select: { repositoryId: true } } },
  });

export const updateIssueStatus = (id: string, status: string) =>
  prisma.securityIssue.update({ where: { id }, data: { status } });

export const createSecurityReport = (
  scanId: string,
  content: string,
  format: string
) =>
  prisma.securityReport.create({ data: { scanId, content, format } });

export const getReportById = (id: string) =>
  prisma.securityReport.findUnique({ where: { id }, include: { scan: true } });
