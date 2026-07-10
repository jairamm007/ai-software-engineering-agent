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
    prompt: string
  ): Promise<string> {
    const response =
      await client.chat.completions.create({
        model: "meta-llama/llama-3.3-70b-instruct",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    return (
      response.choices[0]?.message?.content ?? ""
    );
  }
}