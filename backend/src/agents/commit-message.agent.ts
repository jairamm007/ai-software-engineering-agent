import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";
import { AgentMemory } from "./agent-memory.js";

export const commitMessageAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult,
  memory?: AgentMemory
) => {
  const deps = memory?.getShared<string[]>("dependencies") ?? [];

  const enrichedContext = deps.length > 0
    ? `${reasoning.context}\n\nExternal dependencies: ${deps.join(", ")}`
    : reasoning.context;

  return executeAgent(
    "commit",
    enrichedContext,
    plan.question,
    memory
  );
};
