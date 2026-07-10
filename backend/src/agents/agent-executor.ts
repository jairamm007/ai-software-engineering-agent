import { generateText } from "../ai/providers/llm.service.js";

import { AGENTS } from "./prompts.js";

import {
  AgentType,
} from "./agent.types.js";

export const executeAgent = async (
  type: AgentType,
  context: string,
  question: string
) => {
  const agent = AGENTS[type];

  const prompt = `
${agent.systemPrompt}

Repository Context:

${context}

Question:

${question}
`;

  return generateText(prompt);
};