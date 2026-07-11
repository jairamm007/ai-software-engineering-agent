import type { RepositoryFile } from "@/types/repository";

export interface FileTreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  file?: RepositoryFile;
  children: FileTreeNode[];
}

export function buildFileTree(
  files: RepositoryFile[]
): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.replace(/\\/g, "/").split("/");

    let current = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath
        ? `${currentPath}/${part}`
        : part;

      const isFolder =
        index < parts.length - 1;

      let node = current.find(
        (item) =>
          item.name === part &&
          item.isFolder === isFolder
      );

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          isFolder,
          children: [],
          file: isFolder ? undefined : file,
        };

        current.push(node);
      }

      current = node.children;
    });
  }

  return root;
}