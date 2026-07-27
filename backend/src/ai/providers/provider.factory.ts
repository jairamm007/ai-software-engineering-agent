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

const MODEL_TO_PROVIDER: Record<string, string> = {
  "gemini-2.5-flash": "gemini",
  "llama-3.3-70b-versatile": "groq",
  "meta-llama/llama-3.3-70b-instruct": "openrouter",
  "gpt-4.1-mini": "openai",
  "llama-3.3-70b": "cerebras",
  "meta-llama/Llama-3-70b-chat-hf": "together",
  "mistral-large-latest": "mistral",
};

// Default order: fastest providers first
const DEFAULT_ORDER = "groq,cerebras,gemini,openai,together,openrouter,mistral";

export class ProviderFactory {
  static getProviders(preferredModel?: string): LLMProvider[] {
    const order = process.env.LLM_PROVIDER_ORDER ?? DEFAULT_ORDER;

    const providers = order
      .split(",")
      .map((provider) => provider.trim().toLowerCase())
      .filter((provider) => registry[provider]);

    // If user has a preferred model, move its provider to the front
    if (preferredModel) {
      const preferredProvider = MODEL_TO_PROVIDER[preferredModel];
      if (preferredProvider && providers.includes(preferredProvider)) {
        providers.splice(providers.indexOf(preferredProvider), 1);
        providers.unshift(preferredProvider);
      }
    }

    return providers.map((provider) => registry[provider]());
  }
}
