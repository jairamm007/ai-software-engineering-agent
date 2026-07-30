import type { Response } from "express";
import type { AuthRequest } from "../auth/auth.middleware.js";
import { runPerformanceAnalysis, generateReport } from "../services/performance.service.js";
import {
  getPerformanceScanById,
  getPerformanceScans,
  getIssuesByRepository,
} from "../repository/performance.repository.js";

export async function startScan(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { repositoryId } = req.body;

    const result = await runPerformanceAnalysis({ userId, repositoryId });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[Performance] Scan error:", error);
    const message = error instanceof Error ? error.message : "Scan failed";
    res.status(500).json({ success: false, error: message });
  }
}

export async function getReport(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const format = (req.query.format as string) || "markdown";

    const report = await generateReport(id, userId, format);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("[Performance] Report error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate report";
    res.status(500).json({ success: false, error: message });
  }
}

export async function getHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    const [total, scans] = await getPerformanceScans(userId, { page, limit });

    res.json({
      success: true,
      data: { scans, total, page, limit },
    });
  } catch (error) {
    console.error("[Performance] History error:", error);
    const message = error instanceof Error ? error.message : "Failed to load history";
    res.status(500).json({ success: false, error: message });
  }
}

export async function getIssues(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const repositoryId = req.params.repositoryId as string;

    const issues = await getIssuesByRepository(repositoryId, userId);

    res.json({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error("[Performance] Issues error:", error);
    const message = error instanceof Error ? error.message : "Failed to load issues";
    res.status(500).json({ success: false, error: message });
  }
}
