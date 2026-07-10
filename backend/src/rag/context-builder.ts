import { RetrievedChunk } from "../vector/vector.repository.js";

export const buildContext = (
  chunks: RetrievedChunk[]
): string => {
  if (chunks.length === 0) {
    return "No relevant repository context found.";
  }

  return chunks
    .map(
      (chunk) => `
Repository:
${chunk.repository}

File:
${chunk.filePath}

Lines:
${chunk.startLine}-${chunk.endLine}

Code:
${chunk.content}
`
    )
    .join(
      "\n----------------------------------------\n"
    );
};