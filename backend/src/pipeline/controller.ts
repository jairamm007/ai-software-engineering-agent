import { runPipeline } from "./pipeline.service.js";
import {
  createDebugRun,
  getDebugRun,
  listDebugRuns,
  listRunSummaries,
  updateDebugRun,
} from "./repository.js";
import { computeStageStatus } from "./stage-status.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import { startRunSchema, historyQuerySchema } from "./validators.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

const parseZodMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "issues" in err) {
    const zodErr = err as { issues: Array<{ message: string }> };
    return zodErr.issues.map((i) => i.message).join(", ");
  }
  if (err instanceof Error) return err.message;
  return "Invalid request";
};

export const startPipelineController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = startRunSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(errorResponse(parseZodMessage(parsed.error)));
      return;
    }

    if (!parsed.data.repositoryId && !parsed.data.repoUrl) {
      res.status(400).json(errorResponse("Provide either repositoryId or repoUrl"));
      return;
    }

    const run = await runPipeline({
      userId,
      repositoryId: parsed.data.repositoryId ?? undefined,
      repoUrl: parsed.data.repoUrl ?? undefined,
      branch: parsed.data.branch ?? undefined,
    });

    res.status(200).json(successResponse(run, "Pipeline run completed"));
  } catch (error) {
    res.status(500).json(
      errorResponse(error instanceof Error ? error.message : "Pipeline run failed")
    );
  }
};

export const getRunController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const run = await getDebugRun(req.params.id as string);
    if (!run || run.userId !== userId) {
      res.status(404).json(errorResponse("Run not found"));
      return;
    }
    res.status(200).json(successResponse(run, "Run fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Fetch failed"));
  }
};

export const getHistoryController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = historyQuerySchema.safeParse(req.query);
    const limit = parsed.success ? parsed.data.limit : 20;
    const runs = await listDebugRuns(userId, limit);
    res.status(200).json(successResponse(runs, "History fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Fetch failed"));
  }
};

const toRunSummary = (run: Awaited<ReturnType<typeof listRunSummaries>>[number]) => ({
  id: run.id,
  repoName: run.repoName,
  repoUrl: run.repoUrl,
  branch: run.branch,
  status: run.status,
  stage: run.stage,
  stackDetected: run.stackDetected,
  failureCount: run.failureCount,
  summary: run.summary,
  createdAt: run.createdAt,
  updatedAt: run.updatedAt,
  stageStatus: computeStageStatus(run),
});

export const listRunsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = historyQuerySchema.safeParse(req.query);
    const limit = parsed.success ? parsed.data.limit : 20;
    const runs = await listRunSummaries(userId, limit);
    res.status(200).json(successResponse(runs.map(toRunSummary), "Runs listed"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Fetch failed"));
  }
};

export const createRunController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = startRunSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(errorResponse(parseZodMessage(parsed.error)));
      return;
    }

    const { repositoryId, repoUrl, branch } = parsed.data;
    if (!repositoryId && !repoUrl) {
      res.status(400).json(errorResponse("Provide either repositoryId or repoUrl"));
      return;
    }

    let resolvedRepoUrl: string | undefined = repoUrl ?? undefined;
    let resolvedRepoName: string | undefined;
    if (!resolvedRepoUrl && repositoryId) {
      let repo: { githubUrl: string; name: string } | null = null;
      try {
        repo = await getRepositoryById(repositoryId, userId);
      } catch {
        repo = null;
      }
      if (!repo) {
        res.status(400).json(errorResponse("Repository not found"));
        return;
      }
      resolvedRepoUrl = repo.githubUrl;
      resolvedRepoName = repo.name;
    }

    if (!resolvedRepoUrl) {
      res.status(400).json(errorResponse("Could not resolve repository URL"));
      return;
    }

    const repoName =
      resolvedRepoName ?? resolvedRepoUrl.replace(/\.git$/, "").split("/").pop();

    const run = await createDebugRun({
      userId,
      repositoryId: repositoryId ?? null,
      repoName: repoName ?? null,
      repoUrl: resolvedRepoUrl,
      branch: branch ?? null,
    });

    void runPipeline({
      userId,
      repositoryId: repositoryId ?? undefined,
      repoUrl: resolvedRepoUrl,
      branch: branch ?? undefined,
      runId: run.id,
    }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Background pipeline failed:", error);
      return updateDebugRun(run.id, {
        status: "failed",
        summary: `Pipeline failed: ${message.slice(0, 1000)}`,
      });
    });

    res.status(201).json(successResponse(run, "Run queued"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Run creation failed"));
  }
};

export const getRunDetailController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const run = await getDebugRun(req.params.id as string);
    if (!run || run.userId !== userId) {
      res.status(404).json(errorResponse("Run not found"));
      return;
    }
    res.status(200).json(
      successResponse({ ...run, stageStatus: computeStageStatus(run) }, "Run fetched")
    );
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Fetch failed"));
  }
};
