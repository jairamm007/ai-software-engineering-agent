export interface GitHubRepository {
  owner: string;
  repo: string;
  url: string;
}

export interface GitHubValidationResult {
  isValid: boolean;
  message: string;
}