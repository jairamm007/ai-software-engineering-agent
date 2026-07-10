import { ProviderFactory } from "./provider.factory.js";

const isRetryableError = (error: unknown): boolean => {
  const message =
    error instanceof Error ? error.message : String(error);

  return (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("ECONNRESET") ||
    message.includes("503") ||
    message.includes("502") ||
    message.includes("500")
  );
};

export const generateText = async (
  prompt: string
): Promise<string> => {
  const providers = ProviderFactory.getProviders();

  let lastError: unknown;

  for (const provider of providers) {
    try {
      console.log(`🤖 Trying ${provider.name}...`);

      const response = await provider.generateText(prompt);

      console.log(`✅ ${provider.name} succeeded`);

      return response;
    } catch (error) {
      console.error(`❌ ${provider.name} failed`);

      lastError = error;

      if (!isRetryableError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};