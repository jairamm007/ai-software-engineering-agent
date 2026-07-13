import { RetrievedChunk } from "../vector/vector.repository.js";

const MAX_CHUNK_CONTENT_CHARS = 2000;

export const buildContext = (
  chunks: RetrievedChunk[]
): string => {
  if (chunks.length === 0) {
    return "No relevant repository context found. Please answer based on your general knowledge if possible.";
  }

  const seen = new Set<string>();

  const uniqueChunks = chunks.filter((chunk) => {
    const key = `${chunk.filePath}:${chunk.startLine}-${chunk.endLine}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueChunks
    .map(
      (chunk, i) => {
        const content =
          chunk.content.length > MAX_CHUNK_CONTENT_CHARS
            ? chunk.content.slice(0, MAX_CHUNK_CONTENT_CHARS) + "\n... [truncated]"
            : chunk.content;

        const relevance =
          chunk.distance < 0.3
            ? "highly relevant"
            : chunk.distance < 0.5
              ? "relevant"
              : "possibly relevant";

        return `### [${i + 1}] ${chunk.filePath} (Lines ${chunk.startLine}-${chunk.endLine}) [${relevance}]
${content}`;
      }
    )
    .join("\n\n---\n\n");
};
