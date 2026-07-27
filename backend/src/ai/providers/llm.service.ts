import { ProviderFactory } from "./provider.factory.js";

const isRetryableError = (error: unknown): boolean => {
  const message =
    error instanceof Error ? error.message : String(error);

  return (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("rate limit") ||
    message.includes("Rate limit") ||
    message.includes("timeout") ||
    message.includes("ECONNRESET") ||
    message.includes("ECONNREFUSED") ||
    message.includes("503") ||
    message.includes("502") ||
    message.includes("overloaded") ||
    message.includes("Too Many Requests") ||
    message.includes("request limit") ||
    message.includes("quota") ||
    message.includes("credits")
  );
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const PROVIDER_TIMEOUT_MS = 25_000;
const MAX_RETRIES_PER_PROVIDER = 1;
const COOLDOWN_MS = 15_000;

const cooldowns = new Map<string, number>();

const isOnCooldown = (name: string): boolean => {
  const until = cooldowns.get(name);
  if (!until) return false;
  if (Date.now() >= until) {
    cooldowns.delete(name);
    return false;
  }
  return true;
};

const setCooldown = (name: string) => {
  cooldowns.set(name, Date.now() + COOLDOWN_MS);
  console.log(`❄️ ${name} on cooldown for ${COOLDOWN_MS / 1000}s`);
};

const withTimeout = <T>(
  promise: Promise<T>,
  ms: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
};

export const generateText = async (
  systemPrompt: string,
  userPrompt: string,
  preferredModel?: string
): Promise<string> => {
  const providers = ProviderFactory.getProviders(preferredModel);

  let lastError: unknown;

  for (const provider of providers) {
    if (isOnCooldown(provider.name)) {
      continue;
    }

    for (let attempt = 0; attempt <= MAX_RETRIES_PER_PROVIDER; attempt++) {
      try {
        if (attempt > 0) {
          await sleep(500);
        }

        console.log(`🤖 ${provider.name}...`);

        const response = await withTimeout(
          provider.generateText(systemPrompt, userPrompt),
          PROVIDER_TIMEOUT_MS
        );

        console.log(`✅ ${provider.name} done`);
        return response;
      } catch (error) {
        console.error(`❌ ${provider.name} failed`);
        lastError = error;

        if (isRetryableError(error)) {
          setCooldown(provider.name);
        }
        break;
      }
    }
  }

  throw lastError;
};

export const generateTextStream = async function* (
  systemPrompt: string,
  userPrompt: string,
  preferredModel?: string,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const providers = ProviderFactory.getProviders(preferredModel);

  for (const provider of providers) {
    if (!provider.generateTextStream) continue;

    if (isOnCooldown(provider.name)) {
      continue;
    }

    for (let attempt = 0; attempt <= MAX_RETRIES_PER_PROVIDER; attempt++) {
      try {
        if (attempt > 0) {
          await sleep(500);
        }

        if (signal?.aborted) return;

        console.log(`🤖 Streaming ${provider.name}...`);
        yield* provider.generateTextStream(systemPrompt, userPrompt);
        console.log(`✅ ${provider.name} stream done`);
        return;
      } catch (error) {
        console.error(`❌ ${provider.name} stream failed`);
        if (isRetryableError(error)) {
          setCooldown(provider.name);
        }
        break;
      }
    }
  }

  console.log("⚠️ Falling back to non-streaming");
  const text = await generateText(systemPrompt, userPrompt, preferredModel);
  yield text;
};
