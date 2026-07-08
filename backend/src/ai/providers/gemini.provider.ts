import { GoogleGenAI } from "@google/genai";
import { EmbeddingProvider } from "./provider.types.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export class GeminiProvider implements EmbeddingProvider {
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    return response.embeddings?.[0]?.values ?? [];
  }
}