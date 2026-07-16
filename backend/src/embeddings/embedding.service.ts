import { GeminiProvider } from "../ai/providers/gemini.provider.js";
import { OpenAIProvider } from "../ai/providers/openai.provider.js";
import type { EmbeddingProvider } from "../ai/providers/provider.types.js";

const providers: { name: string; provider: EmbeddingProvider }[] = [
  { name: "Gemini", provider: new GeminiProvider() },
  { name: "OpenAI", provider: new OpenAIProvider() },
];

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  let lastError: unknown;

  for (const { name, provider } of providers) {
    try {
      const embedding = await provider.generateEmbedding(text);
      if (embedding.length > 0) return embedding;
    } catch (err) {
      console.error(`❌ ${name} embedding failed, trying next...`);
      lastError = err;
      await sleep(200);
    }
  }

  throw lastError ?? new Error("All embedding providers failed");
};