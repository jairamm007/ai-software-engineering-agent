import { GeminiProvider } from "../ai/providers/gemini.provider.js";
import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";

const gemini = new GeminiProvider();

export const answerAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult
) => {
  const prompt = `
You are an expert software engineer.

Task:
${plan.task}

Repository Context:
${reasoning.context}

Question:
${plan.question}

Instructions:
- Answer only using the repository context.
- If the repository does not contain enough information, clearly state that.
- Mention file names and line ranges whenever possible.
`;

  return gemini.generateText(prompt);
};