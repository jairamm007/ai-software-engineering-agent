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
}

export interface MultiAgentResult {
  question: string;
  task: string;
  confidence: number;
  steps: AgentExecutionStep[];
  finalOutput: string;
  totalDurationMs: number;
  agentsExecuted: number;
}

export interface AgentDefinition {
  id: AgentName;
  label: string;
}

export const getAgentDefinitions = async (): Promise<AgentDefinition[]> => {
  const response = await api.get<ApiResponse<AgentDefinition[]>>("/multi-agent/agents");
  return response.data.data;
};

export const orchestrateMultiAgent = async (
  question: string,
  repositoryId?: string,
  filePath?: string
): Promise<MultiAgentResult> => {
  const response = await api.post<ApiResponse<MultiAgentResult>>(
    "/multi-agent/orchestrate",
    { question, repositoryId, filePath }
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
