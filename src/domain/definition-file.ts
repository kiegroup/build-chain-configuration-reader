import { Build, BuildCommand } from "@bc-cr/domain/build";
import { Dependency } from "@bc-cr/domain/dependencies";

export interface DefinitionFile {
  version: "2.1" | 2.1 | "2.2" | 2.2;
  dependencies?: string | Dependency[];
  extends?: string;
  default?: {
    "build-command": BuildCommand;
  };
  build?: Build[];
  pre?: string[];
  post?: string[];
}
