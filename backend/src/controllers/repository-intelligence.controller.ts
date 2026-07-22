import { getRepositoryById } from "../repository/repository.repository.js";
import {
  buildFolderTree,
  getLanguageStatistics,
  getComplexityAnalysis,
  getImportGraph,
  getCallGraph,
  getArchitectureDiagram,
} from "../services/repository-intelligence.service.js";
import { errorResponse, successResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

const getRepo = async (req: AuthRequest & { params: { id: string } }, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return null; }
  const repository = await getRepositoryById(req.params.id, userId);
  if (!repository) { res.status(404).json(errorResponse("Repository not found")); return null; }
  return repository;
};

export const getFolderTreeController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const tree = buildFolderTree(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(tree, "Folder tree fetched successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to build folder tree"));
  }
};

export const getLanguageStatsController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const stats = getLanguageStatistics(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(stats, "Language statistics fetched successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to get language statistics"));
  }
};

export const getComplexityController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const analysis = getComplexityAnalysis(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(analysis, "Complexity analysis completed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to analyze complexity"));
  }
};

export const getImportGraphController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const graph = getImportGraph(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(graph, "Import graph fetched successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to build import graph"));
  }
};

export const getCallGraphController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const graph = getCallGraph(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(graph, "Call graph fetched successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to build call graph"));
  }
};

export const getArchitectureController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const diagram = getArchitectureDiagram(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(diagram, "Architecture diagram generated successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate architecture diagram"));
  }
};
