import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";
import { AgentMemory } from "./agent-memory.js";

export const securityAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult,
  memory?: AgentMemory
) => {
  const deps = memory?.getShared<string[]>("dependencies") ?? [];
  const patterns = memory?.getShared<string[]>("detectedPatterns") ?? [];

  let enrichedContext = reasoning.context;
  if (deps.length > 0) {
    const securityRelevant = deps.filter((d) =>
      d.includes("auth") || d.includes("crypto") || d.includes("jwt") || d.includes("session")
    );
    if (securityRelevant.length > 0) {
      enrichedContext += `\n\nSecurity-relevant dependencies: ${securityRelevant.join(", ")}`;
    }
  }

  if (patterns.length > 0) {
    enrichedContext += `\nDetected patterns: ${patterns.join(", ")}`;
  }

  if (memory) {
    memory.addInsight({
      agent: "security",
      type: "finding",
      content: `Security audit analyzing ${reasoning.totalChunks} chunks, ${deps.length} external dependencies`,
      severity: "info",
    });
  }

  return executeAgent(
    "security",
    enrichedContext,
    plan.question,
    memory
  );
};
