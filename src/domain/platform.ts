export interface Platform {
  name?: string;
  id: string;
  type: PlatformType
  serverUrl: string,
  apiUrl: string
}

export enum PlatformType {
  GITHUB = "github",
  GITLAB = "gitlab"
}

export const DEFAULT_GITHUB_SERVER_URL = "https://github.com";
export const DEFAULT_GITHUB_API_URL = "https://api.github.com";
export const DEFAULT_GITLAB_SERVER_URL = "https://gitlab.com";
export const DEFAULT_GITLAB_API_URL = "https://gitlab.com/api/v4";