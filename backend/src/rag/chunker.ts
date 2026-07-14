import fs from "fs/promises";
import { randomUUID } from "crypto";

import { CodeChunk } from "./rag.types.js";

export const chunkFile = async (
  filePath: string,
  chunkSize = 50
): Promise<CodeChunk[]> => {
  const content = await fs.readFile(filePath, "utf8");

  const lines = content.split("\n");

  const chunks: CodeChunk[] = [];

  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push({
      id: randomUUID(),
      filePath,
      content: lines.slice(i, i + chunkSize).join("\n"),
      startLine: i + 1,
      endLine: Math.min(i + chunkSize, lines.length),
    });
  }

  return chunks;
};
