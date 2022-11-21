import { DefinitionFile } from "@bc-cr/domain/definition-file";
import { BuildCommandSchema, BuildSchema } from "@bc-cr/schema/build";
import { DependenciesSchema } from "@bc-cr/schema/dependencies";
import { JSONSchemaType } from "ajv";

export const DefintionFileSchema: JSONSchemaType<DefinitionFile> = {
  type: "object",
  properties: {
    version: { type: ["string", "number"], enum: ["2.1", 2.1, "2.2", 2.2] },
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
    }
  },
  required: ["version"],
  additionalProperties: false,
};
