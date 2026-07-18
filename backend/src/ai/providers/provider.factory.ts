import { GeminiProvider } from "./gemini.provider.js";
import { GroqProvider } from "./groq.provider.js";
import { OpenAIProvider } from "./openai.provider.js";
import { OpenRouterProvider } from "./openrouter.provider.js";
import { CerebrasProvider } from "./cerebras.provider.js";
import { TogetherProvider } from "./together.provider.js";
import { MistralProvider } from "./mistral.provider.js";

import { LLMProvider } from "./provider.types.js";

const registry: Record<string, () => LLMProvider> = {
  groq: () => new GroqProvider(),
  cerebras: () => new CerebrasProvider(),
  together: () => new TogetherProvider(),
  gemini: () => new GeminiProvider(),
  openai: () => new OpenAIProvider(),
  openrouter: () => new OpenRouterProvider(),
  mistral: () => new MistralProvider(),
};

// Default order: fastest providers first
const DEFAULT_ORDER = "groq,cerebras,together,gemini,openai,openrouter,mistral";

export class ProviderFactory {
  static getProviders(): LLMProvider[] {
    const order = process.env.LLM_PROVIDER_ORDER ?? DEFAULT_ORDER;

    return order
      .split(",")
      .map((provider) => provider.trim().toLowerCase())
      .filter((provider) => registry[provider])
      .map((provider) => registry[provider]());
  }
}
