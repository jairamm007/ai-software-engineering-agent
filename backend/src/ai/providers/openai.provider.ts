import OpenAI from "openai";

import { LLMProvider } from "./provider.types.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIProvider
  implements LLMProvider
{
  readonly name = "OpenAI";

  async generateText(
    prompt: string
  ): Promise<string> {
    const response =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",
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