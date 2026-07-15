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
  readonly name = "Gemini";

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
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 4096,
        temperature: 0.3,
      },
      contents: userPrompt,
    });

    return response.text ?? "";
  }

  async *generateTextStream(
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string> {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 4096,
        temperature: 0.3,
      },
      contents: userPrompt,
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) yield text;
    }
  }
}
