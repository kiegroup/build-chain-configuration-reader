import { Build, BuildCommand } from "@bc-cr/domain/build";
import { Dependency } from "@bc-cr/domain/dependencies";
import { Mapping } from "@bc-cr/domain/mapping";

export interface DefinitionFile {
  version: "2.1" | 2.1
  dependencies: string | {
    project: string;
    dependencies?: Dependency[];
    mapping?: Mapping
  }[]
  extends?: string;
  default?: {
    "build-command": BuildCommand
  }
  build?: Build[]
}
