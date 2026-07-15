import OpenAI from "openai";

import { LLMProvider } from "./provider.types.js";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export class OpenRouterProvider
  implements LLMProvider
{
  readonly name = "OpenRouter";

  async generateText(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const response =
      await client.chat.completions.create({
        model: "meta-llama/llama-3.3-70b-instruct",
        max_tokens: 4096,
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
      model: "meta-llama/llama-3.3-70b-instruct",
      max_tokens: 4096,
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
