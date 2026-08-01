import { prisma } from "../database/prisma.js";
import type { Prisma } from "@prisma/client";

export const createDebugRun = (input: {
  userId: string;
  repositoryId?: string | null;
  repoName?: string | null;
  repoUrl?: string | null;
  branch?: string | null;
}) =>
  prisma.debugRun.create({
    data: {
      userId: input.userId,
      repositoryId: input.repositoryId ?? null,
      repoName: input.repoName ?? null,
      repoUrl: input.repoUrl ?? null,
      branch: input.branch ?? null,
    },
  });

export const updateDebugRun = (
  id: string,
  data: Prisma.DebugRunUpdateInput
) => prisma.debugRun.update({ where: { id }, data });

export const getDebugRun = (id: string) =>
  prisma.debugRun.findUnique({
    where: { id },
    include: {
      failures: true,
      diagnoses: true,
      patches: { orderBy: { attemptNumber: "asc" } },
      security: true,
      baselines: { orderBy: { createdAt: "asc" } },
      comparisons: true,
    },
  });

export const listDebugRuns = (userId: string, limit = 20) =>
  prisma.debugRun.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      failures: true,
      diagnoses: true,
      patches: true,
      security: true,
      baselines: true,
      comparisons: true,
    },
  });

export const listRunSummaries = (userId: string, limit = 20) =>
  prisma.debugRun.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      failures: { select: { id: true } },
      diagnoses: { select: { id: true } },
      patches: { select: { status: true } },
      security: { select: { blocked: true, status: true } },
      baselines: { select: { id: true } },
      comparisons: { select: { flagged: true } },
    },
  });

export const createDebugFailures = (
  debugRunId: string,
  failures: Array<{
    testName?: string;
    testFile?: string;
    errorType?: string;
    errorMessage?: string;
    stackTrace?: string;
    implicatedFiles?: string[];
  }>
) =>
  prisma.debugFailure.createMany({
    data: failures.map((f) => ({
      debugRunId,
      testName: f.testName ?? null,
      testFile: f.testFile ?? null,
      errorType: f.errorType ?? null,
      errorMessage: f.errorMessage ?? null,
      stackTrace: f.stackTrace ?? null,
      implicatedFiles: f.implicatedFiles ?? undefined,
    })),
  });

export const createDiagnosis = (input: {
  debugRunId: string;
  failureId?: string | null;
  reasoning: string;
  rootCauseFile?: string | null;
  rootCauseLine?: number | null;
  confidence: number;
  modelUsed?: string | null;
}) =>
  prisma.diagnosis.create({
    data: {
      debugRunId: input.debugRunId,
      failureId: input.failureId ?? null,
      reasoning: input.reasoning,
      rootCauseFile: input.rootCauseFile ?? null,
      rootCauseLine: input.rootCauseLine ?? null,
      confidence: input.confidence,
      modelUsed: input.modelUsed ?? null,
    },
  });

export const createPatch = (input: {
  debugRunId: string;
  attemptNumber: number;
  diffText: string;
  summary?: string | null;
  filesTouched?: string[];
  status?: string;
  testResult?: string | null;
  testOutput?: string | null;
}) =>
  prisma.patch.create({
    data: {
      debugRunId: input.debugRunId,
      attemptNumber: input.attemptNumber,
      diffText: input.diffText,
      summary: input.summary ?? null,
      filesTouched: input.filesTouched ?? undefined,
      status: input.status ?? "proposed",
      testResult: input.testResult ?? null,
      testOutput: input.testOutput ?? null,
    },
  });

export const updatePatch = (
  id: string,
  data: Prisma.PatchUpdateInput
) => prisma.patch.update({ where: { id }, data });

export const upsertSecurityScan = (input: {
  debugRunId: string;
  tool?: string;
  summary?: string;
  findings?: any[];
  blocked?: boolean;
  status?: string;
}) =>
  prisma.securityScanResult.upsert({
    where: { debugRunId: input.debugRunId },
    create: {
      debugRunId: input.debugRunId,
      tool: input.tool ?? "bandit",
      summary: input.summary ?? null,
      findings: input.findings ?? undefined,
      blocked: input.blocked ?? false,
      status: input.status ?? "done",
    },
    update: {
      tool: input.tool ?? "bandit",
      summary: input.summary ?? null,
      findings: input.findings ?? undefined,
      blocked: input.blocked ?? false,
      status: input.status ?? "done",
    },
  });

export const createPerfBaseline = (input: {
  debugRunId: string;
  stage: string;
  timeMs?: number | null;
  memoryMb?: number | null;
  queryCount?: number | null;
  command?: string | null;
  heuristic?: unknown;
}) =>
  prisma.perfBaseline.create({
    data: {
      debugRunId: input.debugRunId,
      stage: input.stage,
      timeMs: input.timeMs ?? null,
      memoryMb: input.memoryMb ?? null,
      queryCount: input.queryCount ?? null,
      command: input.command ?? null,
      heuristic: input.heuristic ?? undefined,
    },
  });

export const createPerfComparison = (input: {
  debugRunId: string;
  metric: string;
  beforeValue?: number | null;
  afterValue?: number | null;
  pctChange?: number | null;
  flagged?: boolean;
}) =>
  prisma.perfComparison.create({
    data: {
      debugRunId: input.debugRunId,
      metric: input.metric,
      beforeValue: input.beforeValue ?? null,
      afterValue: input.afterValue ?? null,
      pctChange: input.pctChange ?? null,
      flagged: input.flagged ?? false,
    },
  });
