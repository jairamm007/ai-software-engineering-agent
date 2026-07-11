import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";

export const fixAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult
) => {
  return executeAgent(
    "fix",
    reasoning.context,
    plan.question
  );
};
