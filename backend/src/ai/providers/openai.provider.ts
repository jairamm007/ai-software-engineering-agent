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
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const response =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",
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
}
