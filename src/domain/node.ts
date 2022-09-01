import { ArchiveArtifacts } from "@bc-cr/domain/archive-artifacts";
import { Commands } from "@bc-cr/domain/commands";
import { Mapping } from "@bc-cr/domain/mapping";

export interface Node {
  project: string;
  parents?: Node[];
  children?: Node[];
  dependencies?: Node[];
  before?: Commands;
  commands?: Commands;
  after?: Commands;
  mapping?: Mapping;
  clone?: string[];
  archiveArtifacts?: ArchiveArtifacts;
}
