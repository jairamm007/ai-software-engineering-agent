import { Request, Response } from "express";

import { getRepositoryById } from "../repository/repository.repository.js";
import { buildDependencyGraph } from "../services/dependency-graph.service.js";
import { executeAgent } from "../services/agent.service.js";
import { errorResponse, successResponse } from "../utils/api-response.js";

export const getDependencyGraphController = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const repository = await getRepositoryById(req.params.id);

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

export const dependencyGraphSummaryController = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const repository = await getRepositoryById(req.params.id);

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
