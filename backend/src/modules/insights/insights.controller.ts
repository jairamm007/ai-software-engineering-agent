import fs from "fs";
import type { Response } from "express";
import type { AuthRequest } from "../../auth/auth.middleware.js";
import { errorResponse, successResponse } from "../../utils/api-response.js";
import {
  exportInsights,
  generateInsights,
  getInsightsForUser,
  type ExportFormat,
} from "./insights.service.js";
import { getInsightReport } from "./insights.repository.js";

type InsightsRequest = AuthRequest & { params: { repositoryId: string } };

const handleError = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  if (message === "Repository not found") {
    res.status(404).json(errorResponse(message));
    return;
  }
  res.status(500).json(errorResponse(message));
};

export const getInsightsController = async (
  req: InsightsRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }
  try {
    const insights = await getInsightsForUser(req.params.repositoryId, userId);
    res.status(200).json(successResponse(insights, "Insights loaded"));
  } catch (error) {
    handleError(res, error, "Failed to load insights");
  }
};

export const refreshInsightsController = async (
  req: InsightsRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }
  try {
    await generateInsights(req.params.repositoryId);
    const insights = await getInsightsForUser(req.params.repositoryId, userId);
    res.status(200).json(successResponse(insights, "Insights refreshed"));
  } catch (error) {
    handleError(res, error, "Failed to refresh insights");
  }
};

const getSection = async (req: InsightsRequest, res: Response, key: "summary" | "architecture" | "recommendations") => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }
  try {
    const insights = await getInsightsForUser(req.params.repositoryId, userId);
    res.status(200).json(
      successResponse({ repositoryId: insights.repositoryId, updatedAt: insights.updatedAt, [key]: insights[key] })
    );
  } catch (error) {
    handleError(res, error, `Failed to load ${key}`);
  }
};

export const getInsightsSummaryController = (req: InsightsRequest, res: Response) =>
  getSection(req, res, "summary");

export const getInsightsArchitectureController = (req: InsightsRequest, res: Response) =>
  getSection(req, res, "architecture");

export const getInsightsRecommendationsController = (req: InsightsRequest, res: Response) =>
  getSection(req, res, "recommendations");

export const exportInsightsController = async (
  req: InsightsRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }
  const format: string = req.body?.format;
  if (format !== "markdown" && format !== "pdf") {
    res.status(400).json(errorResponse("Invalid format. Use 'markdown' or 'pdf'"));
    return;
  }
  try {
    const report = await exportInsights(req.params.repositoryId, userId, format as ExportFormat);
    res.status(201).json(successResponse(report, "Report exported"));
  } catch (error) {
    handleError(res, error, "Failed to export insights");
  }
};

export const downloadInsightReportController = async (
  req: AuthRequest & { params: { reportId: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }
  try {
    const report = await getInsightReport(req.params.reportId);
    if (!report || report.projectInsights.repository.userId !== userId) {
      res.status(404).json(errorResponse("Report not found"));
      return;
    }
    if (!fs.existsSync(report.reportPath)) {
      res.status(404).json(errorResponse("Report file is missing"));
      return;
    }
    res.download(report.reportPath, report.filename);
  } catch (error) {
    handleError(res, error, "Failed to download report");
  }
};
