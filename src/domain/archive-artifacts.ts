export enum ArchiveOn {
  SUCCESS = "success",
  FAILURE = "failure",
}

export enum IfNoFilesFound {
  WARN = "warn",
  ERROR = "error",
  IGNORE = "ignore",
}

export enum ArchiveDependencies {
  ALL = "all",
  NONE = "none",
}

export type ArchiveArtifacts = {
  "if-no-files-found"?: IfNoFilesFound;
  dependencies?: string[] | ArchiveDependencies;
  name: string;
  paths: {
    path?: string;
    on?: ArchiveOn;
  }[];
};
