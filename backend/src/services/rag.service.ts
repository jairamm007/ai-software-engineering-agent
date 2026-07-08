import { semanticSearch } from "./search.service.js";
import { GeminiProvider } from "../ai/providers/gemini.provider.js";

import { buildContext } from "../rag/context-builder.js";

const gemini = new GeminiProvider();

export const askRepository = async (
  question: string
) => {
  const chunks = await semanticSearch(question);

  const context = buildContext(chunks);

  const prompt = `
You are an expert software engineer.

Use ONLY the repository context below.

${context}

Question:

${question}

If the answer cannot be determined from the repository,
say that you do not have enough information.
`;

  const answer =
    await gemini.generateText(prompt);

  return {
    answer,
    chunks,
  };
};