import {
  runSecurityScan,
  generateReport,
} from "../services/security.service.js";
import {
  getSecurityScans,
  getSecurityScanById,
  getIssuesByRepository,
  updateIssueStatus,
  getReportById,
} from "../repository/security.repository.js";
import {
  scanRepositorySchema,
  historyQuerySchema,
  updateIssueSchema,
} from "../validators/security.validator.js";
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

export const scanRepositoryController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = scanRepositorySchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    const result = await runSecurityScan({
      userId,
      repositoryId: parsed.data.repositoryId,
    });

    res.status(200).json(successResponse(result, "Security scan completed"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Security scan failed"));
  }
};

export const getReportController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const format = (req.query.format as string) || "markdown";

    const report = await generateReport(id, userId, format);
    if (!report) { res.status(404).json(errorResponse("Report not found")); return; }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="security-report-${id}.pdf"`);
      res.send(report.content);
    } else {
      res.status(200).json(successResponse(report, "Report generated"));
    }
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Report generation failed"));
  }
};

export const getHistoryController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = historyQuerySchema.safeParse(req.query);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    const [total, scans] = await getSecurityScans(userId, parsed.data);
    res.status(200).json(successResponse({ scans, total, page: parsed.data.page, limit: parsed.data.limit }, "History fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch history"));
  }
};

export const getIssuesController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const repoParam = req.params.repositoryId;
    const repositoryId = Array.isArray(repoParam) ? repoParam[0] : repoParam;

    const issues = await getIssuesByRepository(repositoryId, userId);
    res.status(200).json(successResponse(issues, "Issues fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch issues"));
  }
};

export const updateIssueController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = updateIssueSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    await updateIssueStatus(parsed.data.issueId, parsed.data.status);
    res.status(200).json(successResponse(null, "Issue updated"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to update issue"));
  }
};

export const getScanByIdController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const scan = await getSecurityScanById(id, userId);
    if (!scan) { res.status(404).json(errorResponse("Scan not found")); return; }
    res.status(200).json(successResponse(scan, "Scan fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch scan"));
  }
};
