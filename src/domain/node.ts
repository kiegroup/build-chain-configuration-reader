import { ArchiveArtifacts } from "@bc-cr/domain/archive-artifacts";
import { CommandLevel } from "@bc-cr/domain/build";
import { Mapping } from "@bc-cr/domain/mapping";

export interface Node {
  project: string;
  parents: Node[];
  children: Node[];
  depth: number;
  before?: CommandLevel;
  commands?: CommandLevel;
  after?: CommandLevel;
  mapping?: Mapping;
  clone?: string[];
  archiveArtifacts?: ArchiveArtifacts;
  platformId: string
}
