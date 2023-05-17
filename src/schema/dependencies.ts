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
      platform: {
        type: "string",
        nullable: true
      },
      dependencies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            project: { type: "string" },
          },
          required: ["project"],
          additionalProperties: false,
        },
        nullable: true,
      },
      mapping: { ...MappingSchema, nullable: true },
    },
    required: ["project"],
    additionalProperties: false,
  },
};

export const DefinitionFileVersionToDependencySchema: {
  "2.2": JSONSchemaType<Omit<Dependency, "platform">[]>,
  "2.3": JSONSchemaType<Dependency[]>
} = {
  "2.3": DependenciesSchema,
  "2.2": {
    ...DependenciesSchema,
    items: {
      ...DependenciesSchema.items,
      properties: {
        ...DependenciesSchema.items.properties,
        platform: false
      }
    }
  } as JSONSchemaType<Omit<Dependency, "platform">[]>
};

