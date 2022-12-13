import { Build, BuildCommand, Command, CommandLevel } from "@bc-cr/domain/build";
import { ArchiveArtifactSchema } from "@bc-cr/schema/archive-artifacts";
import { ProjectNameSchema } from "@bc-cr/schema/project-name";
import { JSONSchemaType } from "ajv";

const CommandSchema: JSONSchemaType<Command> = {
  type: "array",
  items: {
    type: "string",
  },
};

const CommandLevelSchema: JSONSchemaType<CommandLevel> = {
  type: "object",
  properties: {
    current: CommandSchema,
    upstream: CommandSchema,
    downstream: CommandSchema,
  },
  required: ["current", "upstream", "downstream"],
  additionalProperties: false,
};

export const BuildCommandSchema: JSONSchemaType<BuildCommand> = {
  type: "object",
  properties: {
    before: {...CommandLevelSchema, nullable: true},
    after: {...CommandLevelSchema, nullable: true},
    current: CommandSchema,
    upstream: CommandSchema,
    downstream: CommandSchema,
  },
  required: ["current", "upstream", "downstream"],
  additionalProperties: false,
};

export const BuildSchema: JSONSchemaType<Build> = {
  type: "object",
  properties: {
    project: ProjectNameSchema,
    "build-command": {...BuildCommandSchema, nullable:  true},
    "archive-artifacts": {...ArchiveArtifactSchema, nullable: true},
    clone: { type: "array", items: { type: "string" }, nullable: true },
  },
  required: ["project"],
  anyOf: [
    {required: ["build-command"]},
    {required: ["archive-artifacts"]},
  ],
};
