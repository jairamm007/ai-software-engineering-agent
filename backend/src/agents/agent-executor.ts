import { generateText } from "../ai/providers/llm.service.js";

import { AGENTS } from "./prompts.js";

import {
  AgentType,
} from "./agent.types.js";

const MAX_CONTEXT_CHARS = 100_000;

const truncateContext = (context: string): string => {
  if (context.length <= MAX_CONTEXT_CHARS) {
    return context;
  }

  return (
    context.slice(0, MAX_CONTEXT_CHARS) +
    "\n\n... [Context truncated for optimal processing] ..."
  );
};

export const executeAgent = async (
  type: AgentType,
  context: string,
  question: string
) => {
  const agent = AGENTS[type];

  const truncatedContext = truncateContext(context);

  const userPrompt = `Repository Context:\n\n${truncatedContext}\n\nQuestion: ${question}`;

  return generateText(agent.systemPrompt, userPrompt);
};
