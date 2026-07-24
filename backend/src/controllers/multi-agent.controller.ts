import { orchestrateMultiAgent, getAgentDefinitions } from "../services/multi-agent.service.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import { executeAgent } from "../agents/agent-executor.js";
import { AGENTS } from "../agents/prompts.js";
import { getAllAgentMetadata, getAgentMetadata } from "../agents/agent-registry.js";
import { getAllTools, getToolsForAgent, describeTools } from "../agents/agent-tools.js";
import { AgentMemory } from "../agents/agent-memory.js";
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
    const { question, repositoryId, filePath, useLLMPlanning } = req.body;
    if (!question) { res.status(400).json(errorResponse("Question is required")); return; }

    if (repositoryId) {
      const repo = await getRepositoryById(repositoryId, userId);
      if (!repo) { res.status(404).json(errorResponse("Repository not found")); return; }
    }

    const result = await orchestrateMultiAgent(question, repositoryId, filePath, useLLMPlanning);
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

export const getAgentMetadataController = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const metadata = getAllAgentMetadata();
    res.status(200).json(successResponse(metadata, "Agent metadata fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch metadata"));
  }
};

export const getAgentMetadataByTypeController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.params;
    const metadata = getAgentMetadata(type as any);
    if (!metadata) {
      res.status(404).json(errorResponse(`Agent type '${type}' not found`));
      return;
    }
    res.status(200).json(successResponse(metadata, "Agent metadata fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch metadata"));
  }
};

export const getToolsController = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tools = getAllTools();
    const toolDescriptions = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
    res.status(200).json(successResponse(toolDescriptions, "Tools fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch tools"));
  }
};

export const getAgentToolsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.params;
    const tools = getToolsForAgent(type);
    const toolDescriptions = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
    res.status(200).json(successResponse(toolDescriptions, "Agent tools fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch agent tools"));
  }
};

export const getMemoryController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const memory = AgentMemory.getInstance(sessionId);
    if (!memory) {
      res.status(404).json(errorResponse("Session not found"));
      return;
    }
    res.status(200).json(successResponse(memory.toContextString(), "Memory fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch memory"));
  }
};
