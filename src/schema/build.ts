import { ArchiveArtifactSchema } from "@bc-cr/schema/archive-artifacts";
import { ProjectNameSchema } from "@bc-cr/schema/project-name";

const CommandSchema = {
  type: "array",
  items: {
    type: "string",
  },
};

const CommandLevelSchema = {
  type: "object",
  properties: {
    current: CommandSchema,
    upstream: CommandSchema,
    downstream: CommandSchema,
  },
  anyOf: [
    { required: ["current"] },
    { required: ["upstream"] },
    { required: ["downstream"] },
  ],
  additionalProperties: false,
};

export const BuildCommandSchema = {
  type: "object",
  properties: {
    before: CommandLevelSchema,
    after: CommandLevelSchema,
    current: CommandSchema,
    upstream: CommandSchema,
    downstream: CommandSchema,
  },
  anyOf: [
    { required: ["before"] },
    { required: ["after"] },
    { required: ["current"] },
    { required: ["upstream"] },
    { required: ["downstream"] },
  ],
  additionalProperties: false,
};

export const BuildSchema = {
  type: "object",
  properties: {
    project: ProjectNameSchema,
    "build-command": BuildCommandSchema,
    "archive-artifacts": ArchiveArtifactSchema
  },
  required: ["project"],
  anyOf: [
    {required: ["build-command"]},
    {required: ["archive-artifacts"]},
  ],
};
