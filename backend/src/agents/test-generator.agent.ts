import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";

export const testGeneratorAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult
) => {
  return executeAgent(
    "test",
    reasoning.context,
    plan.question
  );
};
