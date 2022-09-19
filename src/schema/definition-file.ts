import { DefinitionFile } from "@bc-cr/domain/definition-file";
import { BuildCommandSchema, BuildSchema } from "@bc-cr/schema/build";
import { DependenciesSchema } from "@bc-cr/schema/dependencies";
import { MappingSchema } from "@bc-cr/schema/mapping";
import { ProjectNameSchema } from "@bc-cr/schema/project-name";
import { JSONSchemaType } from "ajv";

export const DefintionFileSchema: JSONSchemaType<DefinitionFile> = {
  type: "object",
  properties: {
    version: { type: ["string", "number"], enum: ["2.1", 2.1] },
    dependencies: {
      type: ["string", "array"],
      oneOf: [
        { type: "string" },
        {
          type: "array",
          items: {
            type: "object",
            properties: {
              project: ProjectNameSchema,
              dependencies: {...DependenciesSchema, nullable: true},
              mapping: {...MappingSchema, nullable: true},
            },
            required: ["project"],
            additionalProperties: false,
          },
        },
      ],
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
  },
  required: ["version", "dependencies"],
  additionalProperties: false,
};
