interface ProviderInfo {
  name: string;
  key: string;
  configured: boolean;
}

const providerEnvMap: { name: string; envKey: string }[] = [
  { name: "Gemini", envKey: "GEMINI_API_KEY" },
  { name: "Groq", envKey: "GROQ_API_KEY" },
  { name: "OpenAI", envKey: "OPENAI_API_KEY" },
  { name: "OpenRouter", envKey: "OPENROUTER_API_KEY" },
  { name: "Cerebras", envKey: "CEREBRAS_API_KEY" },
  { name: "Together", envKey: "TOGETHER_API_KEY" },
  { name: "Mistral", envKey: "MISTRAL_API_KEY" },
];

export const getAIProviders = (): { count: number; providers: ProviderInfo[] } => {
  const providers: ProviderInfo[] = providerEnvMap.map((p) => ({
    name: p.name,
    key: p.envKey,
    configured: Boolean(process.env[p.envKey] && process.env[p.envKey]!.trim() !== ""),
  }));

  return {
    count: providers.filter((p) => p.configured).length,
    providers,
  };
};
