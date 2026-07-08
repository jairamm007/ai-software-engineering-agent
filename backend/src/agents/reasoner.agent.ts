import { buildContext } from "../rag/context-builder.js";

export interface ReasoningResult {
  context: string;
  totalChunks: number;
}

export const reasonerAgent = async (
  chunks: any[]
): Promise<ReasoningResult> => {
  return {
    context: buildContext(chunks),
    totalChunks: chunks.length,
  };
};