import { DefinitionFile } from "@bc-cr/domain/definition-file";
import { BuildCommandSchema, BuildSchema } from "@bc-cr/schema/build";
import { DefinitionFileVersionToDependencySchema, DependenciesSchema } from "@bc-cr/schema/dependencies";
import { PlatformSchema } from "@bc-cr/schema/platform";
import { JSONSchemaType } from "ajv";

export const DefintionFileSchema: JSONSchemaType<DefinitionFile> = {
  type: "object",
  properties: {
    version: { type: ["string", "number"], enum: ["2.1", 2.1, "2.2", 2.2, "2.3", 2.3] },
    dependencies: {
      type: ["string", "array"],
      oneOf: [
        { type: "string" },
        DependenciesSchema,
      ],
      nullable: true
    },
    extends: {
      type: "string",
      nullable: true
    },
    default: {
      type: "object",
      properties: {
        "build-command": BuildCommandSchema,
      },
      required: ["build-command"],
      nullable: true,
      additionalProperties: false,
    },
    build: {
      type: "array",
      items: BuildSchema,
      nullable: true
    },
    pre: {
      type: "array",
      items: {
        type: "string"
      },
      nullable: true
    },
    post: {
      type: "object",
      properties: {
        success: {type: "array", items: {type: "string"}, nullable: true},
        always: {type: "array", items: {type: "string"}, nullable: true},
        failure: {type: "array", items: {type: "string"}, nullable: true},
      },
      nullable: true
    },
    platforms: {
      type: "array",
      items: PlatformSchema,
      nullable: true
    }
  },
  if: {
    properties: {
      version: {
        not: {
          enum: ["2.3", 2.3]
        }
      }
    }
  },
  then: {
    properties: {
      dependencies: {
        type: ["string", "array"],
        oneOf: [
          { type: "string" },
          DefinitionFileVersionToDependencySchema["2.2"],
        ],
        nullable: true
      },
      platforms: false
    }
  },
  required: ["version"],
  additionalProperties: false,
};
