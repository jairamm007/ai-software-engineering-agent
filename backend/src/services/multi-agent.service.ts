import { agentGraph } from "../agents/graph.state.js";
import { plannerAgent, PlanResult } from "../agents/planner.agent.js";
import { retrieverAgent } from "../agents/retriever.agent.js";
import { reasonerAgent, ReasoningResult } from "../agents/reasoner.agent.js";
import { answerAgent } from "../agents/answer.agent.js";
import { codeReviewAgent } from "../agents/code-review.agent.js";
import { fixAgent } from "../agents/fix.agent.js";
import { commitMessageAgent } from "../agents/commit-message.agent.js";
import { architectureAgent } from "../agents/architecture.agent.js";
import { documentationAgent } from "../agents/documentation.agent.js";
import { pullRequestAgent } from "../agents/pull-request.agent.js";
import { testGeneratorAgent } from "../agents/test-generator.agent.js";
import { securityAgent } from "../agents/security.agent.js";
import { RetrievedChunk } from "../vector/vector.repository.js";

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

const AGENT_LABELS: Record<AgentName, string> = {
  planner: "Planner",
  retriever: "Retriever",
  reasoner: "Reasoner",
  answer: "Answer",
  codeReview: "Code Review",
  fix: "Fix",
  commitMessage: "Commit Message",
  architecture: "Architecture",
  documentation: "Documentation",
  pullRequest: "Pull Request",
  testGenerator: "Test Generator",
  security: "Security",
};

function createStep(agent: AgentName): AgentExecutionStep {
  return {
    agent,
    label: AGENT_LABELS[agent],
    status: "pending",
  };
}

function startStep(step: AgentExecutionStep): AgentExecutionStep {
  return { ...step, status: "running", startedAt: new Date().toISOString() };
}

function completeStep(step: AgentExecutionStep, output: string): AgentExecutionStep {
  const now = new Date().toISOString();
  const duration = step.startedAt
    ? new Date(now).getTime() - new Date(step.startedAt).getTime()
    : 0;
  return { ...step, status: "completed", completedAt: now, durationMs: duration, output };
}

function errorStep(step: AgentExecutionStep, error: string): AgentExecutionStep {
  const now = new Date().toISOString();
  const duration = step.startedAt
    ? new Date(now).getTime() - new Date(step.startedAt).getTime()
    : 0;
  return { ...step, status: "error", completedAt: now, durationMs: duration, error };
}

function skipStep(step: AgentExecutionStep): AgentExecutionStep {
  return { ...step, status: "skipped" };
}

export const getAgentDefinitions = () => {
  return Object.entries(AGENT_LABELS).map(([key, label]) => ({
    id: key as AgentName,
    label,
  }));
};

export const orchestrateMultiAgent = async (
  question: string,
  repositoryId?: string,
  filePath?: string
): Promise<MultiAgentResult> => {
  const startTime = Date.now();
  const steps: AgentExecutionStep[] = [];

  const plannerStep = createStep("planner");
  const retrieverStep = createStep("retriever");
  const reasonerStep = createStep("reasoner");

  let plan: PlanResult;
  let chunks: RetrievedChunk[];
  let reasoning: ReasoningResult;

  // --- PLANNER ---
  steps.push(startStep(plannerStep));
  try {
    plan = await plannerAgent({ question, repositoryId, filePath });
    steps[steps.length - 1] = completeStep(
      steps[steps.length - 1],
      `Task: ${plan.task} (confidence: ${(plan.confidence * 100).toFixed(0)}%)`
    );
  } catch (err) {
    steps[steps.length - 1] = errorStep(
      steps[steps.length - 1],
      err instanceof Error ? err.message : "Planner failed"
    );
    return buildResult(question, steps, startTime);
  }

  // --- RETRIEVER ---
  steps.push(startStep(retrieverStep));
  try {
    chunks = await retrieverAgent(plan);
    steps[steps.length - 1] = completeStep(
      steps[steps.length - 1],
      `Retrieved ${chunks.length} chunks from ${new Set(chunks.map(c => c.filePath)).size} files`
    );
  } catch (err) {
    steps[steps.length - 1] = errorStep(
      steps[steps.length - 1],
      err instanceof Error ? err.message : "Retriever failed"
    );
    return buildResult(question, steps, startTime);
  }

  // --- REASONER ---
  steps.push(startStep(reasonerStep));
  try {
    reasoning = await reasonerAgent(chunks);
    steps[steps.length - 1] = completeStep(
      steps[steps.length - 1],
      `Built context: ${reasoning.context.length} chars from ${reasoning.totalChunks} chunks`
    );
  } catch (err) {
    steps[steps.length - 1] = errorStep(
      steps[steps.length - 1],
      err instanceof Error ? err.message : "Reasoner failed"
    );
    return buildResult(question, steps, startTime);
  }

  // --- SPECIALIZED AGENT ---
  const agentMap: Record<string, { step: AgentExecutionStep; fn: () => Promise<string> }> = {
    review: { step: createStep("codeReview"), fn: async () => (await codeReviewAgent(plan!, reasoning!)).summary },
    fix: { step: createStep("fix"), fn: async () => await fixAgent(plan!, reasoning!) },
    commit: { step: createStep("commitMessage"), fn: async () => await commitMessageAgent(plan!, reasoning!) },
    architecture: { step: createStep("architecture"), fn: async () => await architectureAgent(plan!, reasoning!.context) },
    documentation: { step: createStep("documentation"), fn: async () => await documentationAgent(plan!, reasoning!.context) },
    pullRequest: { step: createStep("pullRequest"), fn: async () => await pullRequestAgent(plan!, reasoning!) },
    test: { step: createStep("testGenerator"), fn: async () => await testGeneratorAgent(plan!, reasoning!) },
    security: { step: createStep("security"), fn: async () => await securityAgent(plan!, reasoning!) },
    answer: { step: createStep("answer"), fn: async () => await answerAgent(plan!, reasoning!) },
  };

  const entry = agentMap[plan!.task] || agentMap.answer;
  steps.push(startStep(entry.step));

  let finalOutput: string;
  try {
    finalOutput = await entry.fn();
    steps[steps.length - 1] = completeStep(steps[steps.length - 1], finalOutput.slice(0, 200) + "...");
  } catch (err) {
    steps[steps.length - 1] = errorStep(
      steps[steps.length - 1],
      err instanceof Error ? err.message : `${entry.step.label} agent failed`
    );
    finalOutput = `Error: ${err instanceof Error ? err.message : "Agent execution failed"}`;
  }

  return {
    question,
    task: plan!.task,
    confidence: plan!.confidence,
    steps,
    finalOutput,
    totalDurationMs: Date.now() - startTime,
    agentsExecuted: steps.filter(s => s.status === "completed").length,
  };
};

function buildResult(question: string, steps: AgentExecutionStep[], startTime: number): MultiAgentResult {
  const lastCompleted = [...steps].reverse().find(s => s.status === "completed");
  return {
    question,
    task: "error",
    confidence: 0,
    steps,
    finalOutput: lastCompleted?.output || "Pipeline failed before producing output",
    totalDurationMs: Date.now() - startTime,
    agentsExecuted: steps.filter(s => s.status === "completed").length,
  };
}
