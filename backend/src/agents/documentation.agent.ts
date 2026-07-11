import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";

export const documentationAgent = async (
  plan: PlanResult,
  context: string
) => {
  return executeAgent(
    "documentation",
    context,
    plan.question
  );
};