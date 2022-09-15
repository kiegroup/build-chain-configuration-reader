import { ProjectNameSchema } from "@bc-cr/schema/project-name";

export const ArchiveArtifactSchema = {
  type: "object", 
  properties: {
    name: {type: "string"},
    path: {
      type: "array",
      items: {type: "string"}
    },
    "if-no-files-found": {
      enum: ["warn", "ignore", "error"],
      default: "warn"
    },
    dependencies: {
      oneOf: [
        {
          enum: ["all", "none"]
        },
        {
          type: "array",
          items: ProjectNameSchema
        }
      ]
    }
  },
  required: ["path", "if-no-files-found", "dependencies"]
};
