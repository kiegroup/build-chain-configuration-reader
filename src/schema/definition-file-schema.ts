import { BuildCommandSchema, BuildSchema } from "@bc-cr/schema/build";
import { DependenciesSchema } from "@bc-cr/schema/dependencies";
import { MappingSchema } from "@bc-cr/schema/mapping";
import { ProjectNameSchema } from "@bc-cr/schema/project-name";

export const DefintionFileSchema = {
  type: "object",
  properties: {
    version: { enum: ["2.1", 2.1] },
    dependencies: {
      oneOf: [
        { type: "string" },
        {
          type: "array",
          items: {
            type: "object",
            properties: {
              project: ProjectNameSchema,
              dependencies: DependenciesSchema,
              mapping: MappingSchema,
            },
            required: ["project"],
            additionalProperties: false,
          },
        },
      ],
    },
    extends: {
      type: "string",
    },
    default: {
      type: "object",
      properties: {
        "build-command": BuildCommandSchema,
      },
      required: ["build-command"],
      additionalProperties: false,
    },
    build: {
      type: "array",
      items: BuildSchema,
    },
  },
  required: ["version", "dependencies"],
  additionalProperties: false,
};
