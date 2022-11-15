import { Depend, Mapping, SourceToTarget } from "@bc-cr/domain/mapping";
import { ProjectNameSchema } from "@bc-cr/schema/project-name";
import { JSONSchemaType } from "ajv";

const SourceToTargetSchema: JSONSchemaType<SourceToTarget> = {
  type: "object",
  properties: {
    source: { type: "string" },
    target: { type: "string", nullable: true },
    targetExpression: { type: "string", nullable: true },
  },
  required: ["source"],
  oneOf: [
    {
      required: ["target"],
    },
    {
      required: ["targetExpression"],
    },
  ],
  additionalProperties: false
};

const DependSchema: JSONSchemaType<Depend> = {
  type: "object",
  properties: {
    default: {
      type: "array",
      items: SourceToTargetSchema
    },
  },
  patternProperties: {
    "^[^/]+/[^/]+$": {
      type: "array",
      items: SourceToTargetSchema
    }
  },
  required: ["default"],
  additionalProperties: false
};

export const MappingSchema: JSONSchemaType<Mapping> = {
  type: "object",
  properties: {
    dependencies: {...DependSchema, nullable: true},
    dependant: {...DependSchema, nullable: true},
    exclude: {
      type: "array",
      items: ProjectNameSchema,
    },
  },
  required: ["exclude"],
  anyOf: [
    {
      required: ["dependencies"]
    },
    {
      required: ["dependant"]
    }
  ],
  additionalProperties: false
};
