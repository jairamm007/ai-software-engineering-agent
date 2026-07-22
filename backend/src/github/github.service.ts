import { GitHubRepository } from "./github.types.js";
import { isValidGitHubUrl } from "./github.utils.js";

export const parseGitHubUrl = (
  url: string
): GitHubRepository | null => {
  if (!isValidGitHubUrl(url)) {
    return null;
  }

  const cleanedUrl = url
    .replace(/\.git$/, "")
    .replace(/^(https?:\/\/)(www\.)?/, "$1");

  const parts = cleanedUrl.replace("https://github.com/", "").replace("http://github.com/", "").split("/");

  return {
    owner: parts[0],
    repo: parts[1],
    url: cleanedUrl,
  };
};