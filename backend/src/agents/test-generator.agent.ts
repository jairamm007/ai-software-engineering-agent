import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";
import { AgentMemory } from "./agent-memory.js";

export const testGeneratorAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult,
  memory?: AgentMemory
) => {
  const complexity = memory?.getShared<{ level: string; score: number }>("complexity");
  const patterns = memory?.getShared<string[]>("detectedPatterns") ?? [];

  let enrichedContext = reasoning.context;
  if (complexity) {
    enrichedContext += `\n\nCode complexity: ${complexity.level} (${complexity.score}/100)`;
  }
  if (patterns.length > 0) {
    const testRelevant = patterns.filter((p) =>
      p.includes("describe") || p.includes("test") || p.includes("Async")
    );
    if (testRelevant.length > 0) {
      enrichedContext += `\nExisting test patterns: ${testRelevant.join(", ")}`;
    }
  }

  if (memory) {
    memory.addInsight({
      agent: "testGenerator",
      type: "finding",
      content: `Generating tests for code with ${complexity?.level ?? "unknown"} complexity, ${reasoning.totalChunks} chunks analyzed`,
      severity: "info",
    });
  }

  return executeAgent(
    "test",
    enrichedContext,
    plan.question,
    memory
  );
};
