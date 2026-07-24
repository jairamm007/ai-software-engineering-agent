import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";
import { AgentMemory } from "./agent-memory.js";

export const answerAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult,
  memory?: AgentMemory
) => {
  return executeAgent(
    "answer",
    reasoning.context,
    plan.question,
    memory
  );
};
