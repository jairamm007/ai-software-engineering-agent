import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";

export const commitMessageAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult
) => {
  return executeAgent(
    "commit",
    reasoning.context,
    plan.question
  );
};
