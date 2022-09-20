import { Dependency } from "@bc-cr/domain/dependencies";
import { MappingSchema } from "@bc-cr/schema/mapping";
import { ProjectNameSchema } from "@bc-cr/schema/project-name";
import { JSONSchemaType } from "ajv";

export const DependenciesSchema: JSONSchemaType<Dependency[]> = {
  type: "array",
  items: {
    type: "object",
    properties: {
      project: ProjectNameSchema,
      dependencies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            project: {type: "string"}
          },
          required: ["project"],
          additionalProperties: false
        },
        nullable: true
      },
      mapping: {...MappingSchema, nullable: true}
    },
    required: ["project"],
    additionalProperties: false,
  },
};
