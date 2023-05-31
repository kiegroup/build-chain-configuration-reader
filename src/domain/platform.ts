export interface Platform {
  name?: string;
  id: string;
  type: PlatformType
  serverUrl: string,
  apiUrl: string,
  tokenId: string,
}

export enum PlatformType {
  GITHUB = "github",
  GITLAB = "gitlab"
}

export const DEFAULT_GITHUB_PLATFORM: Platform = {
  id: "github-default",
  type: PlatformType.GITHUB,
  serverUrl: "https://github.com",
  apiUrl: "https://api.github.com",
  tokenId: "GITHUB_TOKEN"
};

export const DEFAULT_GITLAB_PLATFORM: Platform = {
  id: "gitlab-default",
  type: PlatformType.GITLAB,
  serverUrl: "https://gitlab.com",
  apiUrl: "https://gitlab.com/api/v4",
  tokenId: "GITLAB_TOKEN"
};