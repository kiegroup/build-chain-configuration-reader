import { ArchiveArtifacts } from "@bc-cr/domain/archive-artifacts";
import { ProjectNameSchema } from "@bc-cr/schema/project-name";
import { JSONSchemaType } from "ajv";

export const ArchiveArtifactSchema: JSONSchemaType<ArchiveArtifacts> = {
  type: "object",
  properties: {
    name: { type: "string", nullable: true },
    paths: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          on: { type: "string", enum: ["success", "failure", "always"] },
        },
        required: ["on", "path"]
      },
    },
    "if-no-files-found": {
      type: "string",
      enum: ["warn", "ignore", "error"],
      default: "warn",
    },
    dependencies: {
      oneOf: [
        {
          type: "string",
          enum: ["all", "none"],
        },
        {
          type: "array",
          items: ProjectNameSchema,
        },
      ],
    },
  },
  required: ["paths", "if-no-files-found", "dependencies"],
};
