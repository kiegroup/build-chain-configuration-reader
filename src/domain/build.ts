import { ArchiveArtifacts } from "@bc-cr/domain/archive-artifacts";

export type Command = string[];

export interface CommandLevel {
  current: Command
  upstream: Command,
  downstream: Command
}

export interface BuildCommand {
  before?: CommandLevel,
  after?: CommandLevel,
  current: Command,
  upstream: Command,
  downstream: Command
}

export interface Build {
  project: string,
  "build-command"?: BuildCommand,
  "archive-artifacts"?: ArchiveArtifacts
}
