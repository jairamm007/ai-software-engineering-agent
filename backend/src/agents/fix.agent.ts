import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";
import { AgentMemory } from "./agent-memory.js";

export const fixAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult,
  memory?: AgentMemory
) => {
  const reviewInsights = memory
    ? memory.getInsights("codeReview").map((i) => i.content).join("\n")
    : "";

  const enrichedContext = reviewInsights
    ? `${reasoning.context}\n\nReview Findings:\n${reviewInsights}`
    : reasoning.context;

  return executeAgent(
    "fix",
    enrichedContext,
    plan.question,
    memory
  );
};
