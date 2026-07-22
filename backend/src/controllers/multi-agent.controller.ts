import { orchestrateMultiAgent, getAgentDefinitions } from "../services/multi-agent.service.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import { executeAgent } from "../agents/agent-executor.js";
import { AGENTS } from "../agents/prompts.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const orchestrateController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { question, repositoryId, filePath } = req.body;
    if (!question) { res.status(400).json(errorResponse("Question is required")); return; }

    let repoLocalPath: string | undefined;
    if (repositoryId) {
      const repo = await getRepositoryById(repositoryId, userId);
      if (repo) repoLocalPath = repo.localPath;
    }

    const result = await orchestrateMultiAgent(question, repositoryId, filePath);
    res.status(200).json(successResponse(result, "Multi-agent orchestration completed"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Orchestration failed"));
  }
};

export const executeSingleAgentController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { agentType, context, question } = req.body;
    if (!agentType || !question) {
      res.status(400).json(errorResponse("agentType and question are required"));
      return;
    }

    if (!AGENTS[agentType]) {
      res.status(400).json(errorResponse(`Unknown agent type: ${agentType}`));
      return;
    }

    const result = await executeAgent(agentType, context || "", question);
    res.status(200).json(successResponse({ agentType, output: result }, "Agent executed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Agent execution failed"));
  }
};

export const getAgentDefinitionsController = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const definitions = getAgentDefinitions();
    res.status(200).json(successResponse(definitions, "Agent definitions fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch agents"));
  }
};
