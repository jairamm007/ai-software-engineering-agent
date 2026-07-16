import { RetrievedChunk } from "../vector/vector.repository.js";

const MAX_CHUNK_CONTENT_CHARS = 8000;

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

  const fileSummary = new Map<string, number[]>();
  for (const chunk of uniqueChunks) {
    const existing = fileSummary.get(chunk.filePath) ?? [];
    existing.push(chunk.startLine);
    fileSummary.set(chunk.filePath, existing);
  }

  const fileList = [...fileSummary.entries()]
    .map(([fp, lines]) => {
      const range = lines.length === 1
        ? `L${lines[0]}`
        : `L${Math.min(...lines)}-${Math.max(...lines)}`;
      return `  - ${fp} (${range})`;
    })
    .join("\n");

  let context = `## Files in context (${uniqueChunks.length} chunks from ${fileSummary.size} files):\n${fileList}\n\n---\n\n`;

  context += uniqueChunks
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

  return context;
};
