import { generateText } from "../ai/providers/llm.service.js";

export const parseJsonFromLlm = <T>(text: string): T | null => {
  let candidate = text.trim();
  const fenceMatch = candidate.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    candidate = fenceMatch[1].trim();
  }

  const objectMatch = candidate.match(/\{[\s\S]*\}/);
  if (!objectMatch) return null;

  try {
    return JSON.parse(objectMatch[0]) as T;
  } catch {
    const trimmed = objectMatch[0]
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return null;
    }
  }
};

export const callLlm = async (
  label: string,
  systemPrompt: string,
  userPrompt: string,
  preferredModel?: string
): Promise<string> => {
  console.log(`🚀 Pipeline LLM call: ${label}`);
  try {
    const result = await generateText(systemPrompt, userPrompt, preferredModel);
    console.log(`✅ Pipeline LLM done: ${label}`);
    return result;
  } catch (error) {
    console.error(`❌ Pipeline LLM failed: ${label}`, error);
    throw error;
  }
};
