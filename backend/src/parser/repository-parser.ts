import fs from "fs";
import path from "path";

export interface ParsedFile {
  path: string;
  imports: string[];
}

export const parseRepository = (
  repositoryPath: string
): ParsedFile[] => {
  const files: ParsedFile[] = [];

  const walk = (dir: string) => {
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);

      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (
        !fullPath.endsWith(".ts") &&
        !fullPath.endsWith(".tsx") &&
        !fullPath.endsWith(".js") &&
        !fullPath.endsWith(".jsx")
      ) {
        continue;
      }

      const content = fs.readFileSync(
        fullPath,
        "utf8"
      );

      // Match: import ... from "path" | export ... from "path" | require("path") | import("path")
      const imports = Array.from(
        content.matchAll(
          /(?:from\s+["']|require\s*\(\s*["']|import\s*\(\s*["'])(.+?)["']/g
        )
      ).map((m) => m[1]);

      files.push({
        path: fullPath,
        imports,
      });
    }
  };

  walk(repositoryPath);

  return files;
};