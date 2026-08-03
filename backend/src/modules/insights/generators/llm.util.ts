import { generateText } from "../../../ai/providers/llm.service.js";

export const generateJsonObject = async <T>(
  systemPrompt: string,
  userPrompt: string,
  fallback: T
): Promise<T> => {
  try {
    const text = await generateText(systemPrompt, userPrompt);
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return fallback;
    const parsed = JSON.parse(text.slice(start, end + 1));
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
};

export const generatePlainText = async (
  systemPrompt: string,
  userPrompt: string,
  fallback: string
): Promise<string> => {
  try {
    const text = (await generateText(systemPrompt, userPrompt)).trim();
    return text || fallback;
  } catch {
    return fallback;
  }
};
