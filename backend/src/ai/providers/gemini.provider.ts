import { GoogleGenAI } from "@google/genai";

import {
  EmbeddingProvider,
  LLMProvider,
} from "./provider.types.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export class GeminiProvider
  implements EmbeddingProvider, LLMProvider
{
  async generateEmbedding(
    text: string
  ): Promise<number[]> {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    return response.embeddings?.[0]?.values ?? [];
  }

  async generateText(
    prompt: string
  ): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text ?? "";
  }
}