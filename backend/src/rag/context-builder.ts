type RetrievedChunk = {
  repository: string;
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  distance: number;
};

export const buildContext = (
  chunks: RetrievedChunk[]
): string => {
  return chunks
    .map(
      (chunk, index) => `
==================================================

Result ${index + 1}

Repository:
${chunk.repository}

File:
${chunk.filePath}

Lines:
${chunk.startLine}-${chunk.endLine}

Similarity:
${chunk.distance.toFixed(4)}

Content:

${chunk.content}
`
    )
    .join("\n");
};