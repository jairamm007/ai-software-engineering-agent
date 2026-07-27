import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export type AgentName =
  | "planner"
  | "retriever"
  | "reasoner"
  | "answer"
  | "codeReview"
  | "fix"
  | "commitMessage"
  | "architecture"
  | "documentation"
  | "pullRequest"
  | "testGenerator"
  | "security";

export type AgentStatus = "pending" | "running" | "completed" | "error" | "skipped";

export interface AgentExecutionStep {
  agent: AgentName;
  label: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  input?: string;
  output?: string;
  error?: string;
  confidence?: number;
}

export interface AgentMemoryInsight {
  agent: string;
  type: string;
  content: string;
  severity: string;
}

export interface AgentPerformanceMetric {
  durationMs: number;
  confidence: number;
  quality: string;
}

export interface MultiAgentResult {
  question: string;
  task: string;
  confidence: number;
  steps: AgentExecutionStep[];
  finalOutput: string;
  totalDurationMs: number;
  agentsExecuted: number;
  memoryInsights: AgentMemoryInsight[];
  executionTrace: string[];
  performanceMetrics: Record<string, AgentPerformanceMetric>;
}

export interface AgentDefinition {
  id: AgentName;
  label: string;
}

export interface AgentMetadata {
  type: AgentName;
  displayName: string;
  description: string;
  capabilities: Array<{ name: string; description: string }>;
  requiredContext: string[];
  optionalContext: string[];
  outputFormat: string;
  maxInputTokens: number;
  estimatedLatencyMs: number;
  canParallelize: boolean;
  dependencies: AgentName[];
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
}

export const getAgentDefinitions = async (): Promise<AgentDefinition[]> => {
  const response = await api.get<ApiResponse<AgentDefinition[]>>("/multi-agent/agents");
  return response.data.data;
};

export const orchestrateMultiAgent = async (
  question: string,
  repositoryId?: string,
  filePath?: string,
  useLLMPlanning?: boolean,
  signal?: AbortSignal
): Promise<MultiAgentResult> => {
  const response = await api.post<ApiResponse<MultiAgentResult>>(
    "/multi-agent/orchestrate",
    { question, repositoryId, filePath, useLLMPlanning },
    { signal }
  );
  return response.data.data;
};

export const executeSingleAgent = async (
  agentType: string,
  context: string,
  question: string
): Promise<{ agentType: string; output: string }> => {
  const response = await api.post<ApiResponse<{ agentType: string; output: string }>>(
    "/multi-agent/execute",
    { agentType, context, question }
  );
  return response.data.data;
};

export const getAgentMetadataList = async (): Promise<AgentMetadata[]> => {
  const response = await api.get<ApiResponse<AgentMetadata[]>>("/multi-agent/metadata");
  return response.data.data;
};

export const getAgentMetadata = async (type: string): Promise<AgentMetadata> => {
  const response = await api.get<ApiResponse<AgentMetadata>>(`/multi-agent/metadata/${type}`);
  return response.data.data;
};

export const getAgentTools = async (): Promise<AgentTool[]> => {
  const response = await api.get<ApiResponse<AgentTool[]>>("/multi-agent/tools");
  return response.data.data;
};

export const getToolsForAgent = async (type: string): Promise<AgentTool[]> => {
  const response = await api.get<ApiResponse<AgentTool[]>>(`/multi-agent/tools/${type}`);
  return response.data.data;
};

export const getAgentMemory = async (sessionId: string): Promise<string> => {
  const response = await api.get<ApiResponse<string>>(`/multi-agent/memory/${sessionId}`);
  return response.data.data;
};
