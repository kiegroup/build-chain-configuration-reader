import { ProjectNameSchema } from "@bc-cr/schema/project-name";

const SourceToTargetSchema = {
  type: "object",
  properties: {
    source: { type: "string" },
    target: { type: "string" },
    targetExpression: { type: "string" },
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

const DependSchema = {
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

export const MappingSchema = {
  type: "object",
  properties: {
    dependencies: DependSchema,
    dependant: DependSchema,
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
