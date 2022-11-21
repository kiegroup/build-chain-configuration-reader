export interface ArchiveArtifacts {
  name?: string;
  "if-no-files-found": `${IfNoFile}`;
  dependencies: string[] | `${ArchiveDependencies}`;
  paths: {
    path: string;
    on: `${ArchiveOn}`;
  }[];
}

export enum ArchiveOn {
  SUCCESS = "success",
  FAILURE = "failure",
}

export enum IfNoFile {
  WARN = "warn",
  ERROR = "error",
  IGNORE = "ignore",
}

export enum ArchiveDependencies {
  ALL = "all",
  NONE = "none",
}
