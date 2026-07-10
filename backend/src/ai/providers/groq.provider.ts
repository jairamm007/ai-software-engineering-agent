import Groq from "groq-sdk";

import { LLMProvider } from "./provider.types.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class GroqProvider implements LLMProvider {
  readonly name = "Groq";

  async generateText(
    prompt: string
  ): Promise<string> {
    const response =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
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