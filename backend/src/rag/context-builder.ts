import { RetrievedChunk } from "../vector/vector.repository.js";

const MAX_CHUNK_CONTENT_CHARS = 6000;
const MAX_TOTAL_CONTEXT_CHARS = 50_000;

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

  // Group by file
  const fileGroups = new Map<string, RetrievedChunk[]>();
  for (const chunk of uniqueChunks) {
    const existing = fileGroups.get(chunk.filePath) ?? [];
    existing.push(chunk);
    fileGroups.set(chunk.filePath, existing);
  }

  // Sort files by relevance
  const sortedFiles = [...fileGroups.entries()].sort((a, b) => {
    const avgA = a[1].reduce((s, c) => s + c.distance, 0) / a[1].length;
    const avgB = b[1].reduce((s, c) => s + c.distance, 0) / b[1].length;
    return avgA - avgB;
  });

  // Compact file summary
  const fileList = sortedFiles
    .map(([fp, chunks]) => {
      const lines = chunks.flatMap((c) => [c.startLine, c.endLine]);
      return `  - ${fp} (L${Math.min(...lines)}-${Math.max(...lines)})`;
    })
    .join("\n");

  let context = `Files (${fileGroups.size} files, ${uniqueChunks.length} chunks):\n${fileList}\n\n---\n\n`;

  // Build chunk content with size tracking
  let totalChars = context.length;
  const parts: string[] = [];

  for (const [filePath, chunks] of sortedFiles) {
    const sorted = [...chunks].sort((a, b) => a.startLine - b.startLine);

    for (const chunk of sorted) {
      const content =
        chunk.content.length > MAX_CHUNK_CONTENT_CHARS
          ? chunk.content.slice(0, MAX_CHUNK_CONTENT_CHARS) + "\n...[truncated]"
          : chunk.content;

      const rel = chunk.distance < 0.3 ? "★" : chunk.distance < 0.5 ? "●" : "○";

      const part = `[${rel} ${filePath}:L${chunk.startLine}-${chunk.endLine}]\n${content}`;

      if (totalChars + part.length > MAX_TOTAL_CONTEXT_CHARS) {
        parts.push("\n...[context limit reached]...");
        break;
      }

      parts.push(part);
      totalChars += part.length;
    }

    if (totalChars >= MAX_TOTAL_CONTEXT_CHARS) break;
  }

  context += parts.join("\n\n---\n\n");
  return context;
};
