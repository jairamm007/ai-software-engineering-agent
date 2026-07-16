import OpenAI from "openai";

import { LLMProvider } from "./provider.types.js";

const client = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
});

export class CerebrasProvider implements LLMProvider {
  readonly name = "Cerebras";

  async generateText(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const response =
      await client.chat.completions.create({
        model: "llama-3.3-70b",
        max_tokens: 16384,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

    return (
      response.choices[0]?.message?.content ?? ""
    );
  }

  async *generateTextStream(
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string> {
    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b",
      max_tokens: 16384,
      temperature: 0.3,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  }
}
