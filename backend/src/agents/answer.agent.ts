import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";

export const answerAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult
) => {
  return executeAgent(
    "answer",
    reasoning.context,
    plan.question
  );
};