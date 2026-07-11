import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";

export const securityAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult
) => {
  return executeAgent(
    "security",
    reasoning.context,
    plan.question
  );
};
