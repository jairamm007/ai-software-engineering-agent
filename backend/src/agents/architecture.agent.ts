import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { AgentMemory } from "./agent-memory.js";

export const architectureAgent = async (
  plan: PlanResult,
  context: string,
  memory?: AgentMemory
) => {
  const patterns = memory?.getShared<string[]>("detectedPatterns") ?? [];
  const deps = memory?.getShared<string[]>("dependencies") ?? [];
  const complexity = memory?.getShared<{ score: number; level: string }>("complexity");

  let enrichedContext = context;
  if (patterns.length > 0 || deps.length > 0 || complexity) {
    enrichedContext += "\n\nPre-analysis:\n";
    if (patterns.length > 0) enrichedContext += `Patterns: ${patterns.join(", ")}\n`;
    if (deps.length > 0) enrichedContext += `External deps: ${deps.join(", ")}\n`;
    if (complexity) enrichedContext += `Complexity: ${complexity.level} (score: ${complexity.score})\n`;
  }

  return executeAgent(
    "architecture",
    enrichedContext,
    plan.question,
    memory
  );
};
