import fs from "fs/promises";
import { randomUUID } from "crypto";

import { CodeChunk } from "./rag.types.js";

const FUNCTION_BOUNDARY = /^(\s*(export\s+)?(async\s+)?(function|class|const\s+\w+\s*=\s*(async\s+)?\(|const\s+\w+\s*=\s*(async\s+)?function|interface\s|type\s|enum\s|module\s|router\.|app\.))/;

export const chunkFile = async (
  filePath: string,
  chunkSize = 60
): Promise<CodeChunk[]> => {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split("\n");

  if (lines.length <= chunkSize) {
    return [{
      id: randomUUID(),
      filePath,
      content,
      startLine: 1,
      endLine: lines.length,
    }];
  }

  const chunks: CodeChunk[] = [];
  let i = 0;

  while (i < lines.length) {
    let end = Math.min(i + chunkSize, lines.length);

    // Try to extend chunk to the next function/class boundary if close
    if (end < lines.length) {
      let searchLimit = Math.min(end + 15, lines.length);
      for (let j = end; j < searchLimit; j++) {
        if (FUNCTION_BOUNDARY.test(lines[j])) {
          end = j;
          break;
        }
      }
    }

    chunks.push({
      id: randomUUID(),
      filePath,
      content: lines.slice(i, end).join("\n"),
      startLine: i + 1,
      endLine: end,
    });

    i = end;
  }

  return chunks;
};
