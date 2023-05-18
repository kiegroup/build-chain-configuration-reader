import { Build, BuildCommand } from "@bc-cr/domain/build";
import { Dependency } from "@bc-cr/domain/dependencies";
import { Platform } from "@bc-cr/domain/platform";
import { Post, Pre } from "@bc-cr/domain/pre-post";

export interface DefinitionFile {
  version: "2.1" | 2.1 | "2.2" | 2.2 | "2.3" | 2.3;
  dependencies?: string | Dependency[];
  extends?: string;
  default?: {
    "build-command": BuildCommand;
  };
  build?: Build[];
  pre?: Pre;
  post?: Post;
  platforms?: Platform[]
}
