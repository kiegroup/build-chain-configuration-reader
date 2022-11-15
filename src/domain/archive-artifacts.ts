export interface ArchiveArtifacts {
  name?: string;
  "if-no-files-found": "warn" | "error" | "ignore";
  dependencies: string[] | "all" | "none";
  paths: {
    path: string;
    on: "success" | "failure";
  }[];
}
