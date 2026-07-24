import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";
import { AgentMemory } from "./agent-memory.js";

export interface CodeReviewResult {
  summary: string;
}

export const codeReviewAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult,
  memory?: AgentMemory
): Promise<CodeReviewResult> => {
  const contextWithMemory = memory
    ? `${reasoning.context}\n\nPatterns detected: ${memory.getShared<string[]>("detectedPatterns")?.join(", ") ?? "none"}`
    : reasoning.context;

  const summary = await executeAgent(
    "review",
    contextWithMemory,
    plan.question,
    memory
  );

  if (memory) {
    memory.addInsight({
      agent: "codeReview",
      type: "metric",
      content: `Review completed — analyzed ${reasoning.totalChunks} chunks across ${reasoning.keyFiles.length} key files`,
      severity: "info",
    });
  }

  return { summary };
};
