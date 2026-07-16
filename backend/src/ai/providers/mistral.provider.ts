import OpenAI from "openai";

import { LLMProvider } from "./provider.types.js";

const client = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

export class MistralProvider implements LLMProvider {
  readonly name = "Mistral";

  async generateText(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const response =
      await client.chat.completions.create({
        model: "mistral-large-latest",
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
      model: "mistral-large-latest",
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
