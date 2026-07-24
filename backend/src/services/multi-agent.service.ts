import { agentGraph } from "../agents/graph.state.js";
import { plannerAgent, PlanResult } from "../agents/planner.agent.js";
import { retrieverAgent, RetrievalResult } from "../agents/retriever.agent.js";
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
import { AgentMemory } from "../agents/agent-memory.js";

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

export interface MultiAgentResult {
  question: string;
  task: string;
  confidence: number;
  steps: AgentExecutionStep[];
  finalOutput: string;
  totalDurationMs: number;
  agentsExecuted: number;
  memoryInsights: Array<{
    agent: string;
    type: string;
    content: string;
    severity: string;
  }>;
  executionTrace: string[];
  performanceMetrics: Record<string, {
    durationMs: number;
    confidence: number;
    quality: string;
  }>;
}

export type { RetrievalResult };

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

function completeStep(step: AgentExecutionStep, output: string, confidence?: number): AgentExecutionStep {
  const now = new Date().toISOString();
  const duration = step.startedAt
    ? new Date(now).getTime() - new Date(step.startedAt).getTime()
    : 0;
  return { ...step, status: "completed", completedAt: now, durationMs: duration, output, confidence };
}

function errorStep(step: AgentExecutionStep, error: string): AgentExecutionStep {
  const now = new Date().toISOString();
  const duration = step.startedAt
    ? new Date(now).getTime() - new Date(step.startedAt).getTime()
    : 0;
  return { ...step, status: "error", completedAt: now, durationMs: duration, error };
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
  filePath?: string,
  useLLMPlanning = false
): Promise<MultiAgentResult> => {
  const startTime = Date.now();
  const steps: AgentExecutionStep[] = [];
  const memory = AgentMemory.create(`session-${Date.now()}`, question);

  // --- PLANNER ---
  const plannerStep = createStep("planner");
  steps.push(startStep(plannerStep));
  let plan: PlanResult;
  try {
    const t0 = Date.now();
    plan = await plannerAgent({ question, repositoryId, filePath, useLLM: useLLMPlanning });
    const duration = Date.now() - t0;
    memory.setMetrics("planner", { executionTimeMs: duration, tokensProcessed: 0, confidence: plan.confidence, coverageScore: 1 });
    steps[steps.length - 1] = completeStep(
      steps[steps.length - 1],
      `Task: ${plan.task} (confidence: ${(plan.confidence * 100).toFixed(0)}%) — ${plan.reasoning}`,
      plan.confidence
    );
  } catch (err) {
    steps[steps.length - 1] = errorStep(
      steps[steps.length - 1],
      err instanceof Error ? err.message : "Planner failed"
    );
    return buildResult(question, steps, startTime, memory);
  }

  // --- RETRIEVER ---
  const retrieverStep = createStep("retriever");
  steps.push(startStep(retrieverStep));
  let retrievalResult: RetrievalResult;
  try {
    const t0 = Date.now();
    retrievalResult = await retrieverAgent(plan, memory);
    const duration = Date.now() - t0;
    memory.setMetrics("retriever", {
      executionTimeMs: duration,
      tokensProcessed: retrievalResult.chunks.reduce((s, c) => s + (c.content?.length ?? 0), 0),
      confidence: retrievalResult.averageRelevance,
      coverageScore: retrievalResult.filesTouched,
    });
    steps[steps.length - 1] = completeStep(
      steps[steps.length - 1],
      `Retrieved ${retrievalResult.totalRetrieved} chunks from ${retrievalResult.filesTouched} files using ${retrievalResult.queriesUsed.length} queries`,
      retrievalResult.averageRelevance
    );
  } catch (err) {
    steps[steps.length - 1] = errorStep(
      steps[steps.length - 1],
      err instanceof Error ? err.message : "Retriever failed"
    );
    return buildResult(question, steps, startTime, memory);
  }

  // --- REASONER ---
  const reasonerStep = createStep("reasoner");
  steps.push(startStep(reasonerStep));
  let reasoning: ReasoningResult;
  try {
    const t0 = Date.now();
    reasoning = await reasonerAgent(retrievalResult.chunks, memory);
    const duration = Date.now() - t0;
    memory.setMetrics("reasoner", {
      executionTimeMs: duration,
      tokensProcessed: reasoning.context.length,
      confidence: reasoning.totalChunks > 0 ? Math.max(0, 1 - reasoning.totalChunks * 0.01) : 0,
      coverageScore: reasoning.keyFiles.length,
    });
    steps[steps.length - 1] = completeStep(
      steps[steps.length - 1],
      `Built context: ${reasoning.context.length} chars, ${reasoning.patterns.length} patterns, complexity: ${reasoning.complexity.level}`,
      reasoning.totalChunks > 0 ? 0.8 : 0.3
    );
  } catch (err) {
    steps[steps.length - 1] = errorStep(
      steps[steps.length - 1],
      err instanceof Error ? err.message : "Reasoner failed"
    );
    return buildResult(question, steps, startTime, memory);
  }

  // --- SPECIALIZED AGENT ---
  const agentMap: Record<string, { step: AgentExecutionStep; fn: () => Promise<string> }> = {
    review: { step: createStep("codeReview"), fn: async () => (await codeReviewAgent(plan!, reasoning!, memory)).summary },
    fix: { step: createStep("fix"), fn: async () => await fixAgent(plan!, reasoning!, memory) },
    commit: { step: createStep("commitMessage"), fn: async () => await commitMessageAgent(plan!, reasoning!, memory) },
    architecture: { step: createStep("architecture"), fn: async () => await architectureAgent(plan!, reasoning!.context, memory) },
    documentation: { step: createStep("documentation"), fn: async () => await documentationAgent(plan!, reasoning!.context, memory) },
    pullRequest: { step: createStep("pullRequest"), fn: async () => await pullRequestAgent(plan!, reasoning!, memory) },
    test: { step: createStep("testGenerator"), fn: async () => await testGeneratorAgent(plan!, reasoning!, memory) },
    security: { step: createStep("security"), fn: async () => await securityAgent(plan!, reasoning!, memory) },
    answer: { step: createStep("answer"), fn: async () => await answerAgent(plan!, reasoning!, memory) },
  };

  const entry = agentMap[plan!.task] || agentMap.answer;
  steps.push(startStep(entry.step));

  let finalOutput: string;
  try {
    const t0 = Date.now();
    finalOutput = await entry.fn();
    const duration = Date.now() - t0;
    const agentMetrics = memory.getMetrics(plan!.task === "review" ? "codeReview" : plan!.task === "commit" ? "commitMessage" : plan!.task === "test" ? "testGenerator" : plan!.task);
    memory.setMetrics(entry.step.agent, {
      executionTimeMs: duration,
      tokensProcessed: finalOutput.length,
      confidence: agentMetrics?.confidence ?? 0.7,
      coverageScore: agentMetrics?.coverageScore ?? 75,
    });
    steps[steps.length - 1] = completeStep(
      steps[steps.length - 1],
      finalOutput.slice(0, 300) + "...",
      agentMetrics?.confidence ?? 0.7
    );
  } catch (err) {
    steps[steps.length - 1] = errorStep(
      steps[steps.length - 1],
      err instanceof Error ? err.message : `${entry.step.label} agent failed`
    );
    finalOutput = `Error: ${err instanceof Error ? err.message : "Agent execution failed"}`;
  }

  const allMetrics = memory.getAllMetrics();
  const performanceMetrics: Record<string, { durationMs: number; confidence: number; quality: string }> = {};
  for (const [agent, m] of allMetrics) {
    performanceMetrics[agent] = {
      durationMs: m.executionTimeMs,
      confidence: m.confidence,
      quality: m.confidence >= 0.8 ? "high" : m.confidence >= 0.5 ? "medium" : "low",
    };
  }

  return {
    question,
    task: plan!.task,
    confidence: plan!.confidence,
    steps,
    finalOutput,
    totalDurationMs: Date.now() - startTime,
    agentsExecuted: steps.filter(s => s.status === "completed").length,
    memoryInsights: memory.getInsights().map((i) => ({
      agent: i.agent,
      type: i.type,
      content: i.content,
      severity: i.severity,
    })),
    executionTrace: memory.getExecutionOrder(),
    performanceMetrics,
  };
};

function buildResult(
  question: string,
  steps: AgentExecutionStep[],
  startTime: number,
  memory: AgentMemory
): MultiAgentResult {
  const lastCompleted = [...steps].reverse().find(s => s.status === "completed");

  const allMetrics = memory.getAllMetrics();
  const performanceMetrics: Record<string, { durationMs: number; confidence: number; quality: string }> = {};
  for (const [agent, m] of allMetrics) {
    performanceMetrics[agent] = {
      durationMs: m.executionTimeMs,
      confidence: m.confidence,
      quality: m.confidence >= 0.8 ? "high" : m.confidence >= 0.5 ? "medium" : "low",
    };
  }

  return {
    question,
    task: "error",
    confidence: 0,
    steps,
    finalOutput: lastCompleted?.output || "Pipeline failed before producing output",
    totalDurationMs: Date.now() - startTime,
    agentsExecuted: steps.filter(s => s.status === "completed").length,
    memoryInsights: memory.getInsights().map((i) => ({
      agent: i.agent,
      type: i.type,
      content: i.content,
      severity: i.severity,
    })),
    executionTrace: memory.getExecutionOrder(),
    performanceMetrics,
  };
}
