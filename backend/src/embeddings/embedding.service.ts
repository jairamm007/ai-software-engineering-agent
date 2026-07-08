import { GeminiProvider } from "../ai/providers/gemini.provider.js";

const provider = new GeminiProvider();

export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  return provider.generateEmbedding(text);
};