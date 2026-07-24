import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { AgentMemory } from "./agent-memory.js";

export const documentationAgent = async (
  plan: PlanResult,
  context: string,
  memory?: AgentMemory
) => {
  const patterns = memory?.getShared<string[]>("detectedPatterns") ?? [];
  const keyFiles = memory?.getShared<string[]>("keyFiles") ?? [];

  let enrichedContext = context;
  if (keyFiles.length > 0) {
    enrichedContext += `\n\nKey files to document: ${keyFiles.join(", ")}`;
  }
  if (patterns.length > 0) {
    enrichedContext += `\nDetected patterns: ${patterns.join(", ")}`;
  }

  return executeAgent(
    "documentation",
    enrichedContext,
    plan.question,
    memory
  );
};
