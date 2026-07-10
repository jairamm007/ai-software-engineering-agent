import { GeminiProvider } from "./gemini.provider.js";
import { GroqProvider } from "./groq.provider.js";
import { OpenAIProvider } from "./openai.provider.js";
import { OpenRouterProvider } from "./openrouter.provider.js";

import { LLMProvider } from "./provider.types.js";

const registry: Record<string, () => LLMProvider> = {
  gemini: () => new GeminiProvider(),
  groq: () => new GroqProvider(),
  openrouter: () => new OpenRouterProvider(),
  openai: () => new OpenAIProvider(),
};

export class ProviderFactory {
  static getProviders(): LLMProvider[] {
    const order =
      process.env.LLM_PROVIDER_ORDER ??
      "gemini,groq,openrouter,openai";

    return order
      .split(",")
      .map((provider) => provider.trim().toLowerCase())
      .filter((provider) => registry[provider])
      .map((provider) => registry[provider]());
  }
}