export const isValidGitHubUrl = (url: string): boolean => {
  const githubRegex =
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

  return githubRegex.test(url);
};