import { plannerAgent } from "./planner.agent.js";
import { retrieverAgent } from "./retriever.agent.js";
import { reasonerAgent } from "./reasoner.agent.js";
import { answerAgent } from "./answer.agent.js";

export const runAgent = async (
  question: string
) => {
  const plan = await plannerAgent({
    question,
  });

  const chunks = await retrieverAgent(plan);

  const reasoning = await reasonerAgent(chunks.chunks);

  const answer = await answerAgent(
    plan,
    reasoning
  );

  return {
    plan,
    answer,
    chunks,
    reasoning,
  };
};