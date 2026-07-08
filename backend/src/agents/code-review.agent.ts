import { GeminiProvider } from "../ai/providers/gemini.provider.js";
import { ReasoningResult } from "./reasoner.agent.js";

const gemini = new GeminiProvider();

export interface CodeReviewResult {
  summary: string;
}

export const codeReviewAgent = async (
  reasoning: ReasoningResult
): Promise<CodeReviewResult> => {
  const prompt = `
You are a senior software engineer performing a code review.

Repository Context:

${reasoning.context}

Review the code and provide:

1. Overall quality
2. Possible bugs
3. Code smells
4. Performance improvements
5. Security concerns
6. Maintainability suggestions

Use only the provided repository context.
`;

  const summary = await gemini.generateText(prompt);

  return {
    summary,
  };
};