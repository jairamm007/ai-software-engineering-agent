import { getRepositoryById } from "../repository/repository.repository.js";
import {
  buildDependencyGraph,
  getBlastRadius,
  getDependents,
  getFileDependencies,
  invalidateGraphCache,
} from "../services/dependency-graph.service.js";
import { executeAgent } from "../services/agent.service.js";
import { errorResponse, successResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const getDependencyGraphController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const repository = await getRepositoryById(req.params.id, userId);

    if (!repository) {
      res.status(404).json(errorResponse("Repository not found"));
      return;
    }

    const graph = buildDependencyGraph(repository.localPath);

    res.status(200).json(
      successResponse(graph, "Dependency graph fetched successfully")
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to generate dependency graph"
      )
    );
  }
};

export const getBlastRadiusController = async (
  req: AuthRequest & { params: { id: string }; query: { file: string; depth?: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const repository = await getRepositoryById(req.params.id, userId);

    if (!repository) {
      res.status(404).json(errorResponse("Repository not found"));
      return;
    }

    const filePath = req.query.file;
    if (!filePath) {
      res.status(400).json(errorResponse("File path is required"));
      return;
    }

    const depth = parseInt(req.query.depth ?? "2", 10);
    const result = getBlastRadius(repository.localPath, filePath, depth);

    res.status(200).json(
      successResponse(result, "Blast radius calculated successfully")
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to calculate blast radius"
      )
    );
  }
};

export const getDependentsController = async (
  req: AuthRequest & { params: { id: string }; query: { file: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const repository = await getRepositoryById(req.params.id, userId);

    if (!repository) {
      res.status(404).json(errorResponse("Repository not found"));
      return;
    }

    const filePath = req.query.file;
    if (!filePath) {
      res.status(400).json(errorResponse("File path is required"));
      return;
    }

    const dependents = getDependents(repository.localPath, filePath);
    const dependencies = getFileDependencies(repository.localPath, filePath);

    res.status(200).json(
      successResponse(
        { file: filePath, dependents, dependencies },
        "File dependencies fetched successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to fetch dependencies"
      )
    );
  }
};

export const invalidateGraphCacheController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const repository = await getRepositoryById(req.params.id, userId);

    if (!repository) {
      res.status(404).json(errorResponse("Repository not found"));
      return;
    }

    invalidateGraphCache(repository.localPath);

    res.status(200).json(
      successResponse(null, "Graph cache invalidated successfully")
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to invalidate cache"
      )
    );
  }
};

export const dependencyGraphSummaryController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const repository = await getRepositoryById(req.params.id, userId);

    if (!repository) {
      res.status(404).json(errorResponse("Repository not found"));
      return;
    }

    const graph = buildDependencyGraph(repository.localPath);
    const result = await executeAgent(
      `Analyze this repository dependency graph. Describe architecture, coupling, cohesion, circular dependencies, and highly connected modules. Graph: ${JSON.stringify(graph)}`
    );

    res.status(200).json(successResponse(result, "Dependency graph summary generated successfully"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to summarize dependency graph"
      )
    );
  }
};
