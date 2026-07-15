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
    message.includes("500") ||
    message.includes("overloaded")
  );
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const PROVIDER_TIMEOUT_MS = 30_000;
const MAX_RETRIES_PER_PROVIDER = 1;

const withTimeout = <T>(
  promise: Promise<T>,
  ms: number
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error("timeout")),
        ms
      )
    ),
  ]);
};

export const generateText = async (
  systemPrompt: string,
  userPrompt: string
): Promise<string> => {
  const providers = ProviderFactory.getProviders();

  let lastError: unknown;

  for (const provider of providers) {
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_PROVIDER; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
          console.log(`⏳ Retrying ${provider.name} in ${delay}ms (attempt ${attempt + 1})...`);
          await sleep(delay);
        }

        console.log(`🤖 Trying ${provider.name}...`);

        const response = await withTimeout(
          provider.generateText(systemPrompt, userPrompt),
          PROVIDER_TIMEOUT_MS
        );

        console.log(`✅ ${provider.name} succeeded`);

        return response;
      } catch (error) {
        console.error(`❌ ${provider.name} failed${attempt > 0 ? ` (attempt ${attempt + 1})` : ""}`);
        lastError = error;

        if (!isRetryableError(error)) {
          break;
        }
      }
    }
  }

  throw lastError;
};

export const generateTextStream = async function* (
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const providers = ProviderFactory.getProviders();

  for (const provider of providers) {
    if (!provider.generateTextStream) continue;

    try {
      console.log(`🤖 Streaming with ${provider.name}...`);
      yield* provider.generateTextStream(systemPrompt, userPrompt);
      console.log(`✅ ${provider.name} stream completed`);
      return;
    } catch (error) {
      console.error(`❌ ${provider.name} stream failed`);
      continue;
    }
  }

  // Fallback: use non-streaming and yield the full response
  console.log("⚠️ No streaming provider available, falling back to non-streaming");
  const text = await generateText(systemPrompt, userPrompt);
  yield text;
};
