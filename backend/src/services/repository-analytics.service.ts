import { prisma } from "../database/prisma.js";

const getFolderPath = (filePath: string) => {
  const separatorIndex = Math.max(
    filePath.lastIndexOf("/"),
    filePath.lastIndexOf("\\")
  );

  return separatorIndex === -1
    ? ""
    : filePath.slice(0, separatorIndex);
};

const getLanguage = (extension: string) => {
  const languages: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    css: "CSS",
    json: "JSON",
    md: "Markdown",
    html: "HTML",
    py: "Python",
    java: "Java",
    go: "Go",
    rs: "Rust",
  };

  return languages[extension.replace(".", "").toLowerCase()] ?? "Other";
};

export const getRepositoryAnalytics = async (repositoryId: string) => {
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: {
      files: {
        select: {
          path: true,
          extension: true,
          size: true,
          _count: {
            select: { chunks: true },
          },
        },
      },
    },
  });

  if (!repository) {
    return null;
  }

  const files = repository.files;
  const totalFiles = files.length;
  const totalChunks = files.reduce(
    (total, file) => total + file._count.chunks,
    0
  );
  const totalSize = files.reduce(
    (total, file) => total + file.size,
    0
  );
  const folders = new Set(
    files.map((file) => getFolderPath(file.path)).filter(Boolean)
  );
  const languageCounts = files.reduce<Record<string, number>>(
    (counts, file) => {
      const language = getLanguage(file.extension);

      counts[language] = (counts[language] ?? 0) + 1;

      return counts;
    },
    {}
  );
  const languages = Object.entries(languageCounts)
    .map(([name, fileCount]) => ({
      name,
      percentage: Math.round((fileCount / totalFiles) * 100),
    }))
    .sort((first, second) => second.percentage - first.percentage);
  const sortedFiles = [...files].sort((first, second) => first.size - second.size);
  const indexedFiles = files.filter((file) => file._count.chunks > 0).length;
  const indexedPercentage = totalFiles
    ? Math.round((indexedFiles / totalFiles) * 100)
    : 0;

  return {
    totalFiles,
    totalChunks,
    totalFolders: folders.size,
    totalSize,
    averageChunksPerFile: totalFiles
      ? Number((totalChunks / totalFiles).toFixed(1))
      : 0,
    averageFileSize: totalFiles
      ? Math.round(totalSize / totalFiles)
      : 0,
    largestFile: sortedFiles.at(-1)
      ? {
          path: sortedFiles.at(-1)!.path,
          size: sortedFiles.at(-1)!.size,
        }
      : null,
    smallestFile: sortedFiles[0]
      ? {
          path: sortedFiles[0].path,
          size: sortedFiles[0].size,
        }
      : null,
    languages,
    indexedPercentage,
    vectorEmbeddings: totalChunks,
    healthScore: indexedPercentage,
  };
};
