import { Dependency } from "@bc-cr/domain/dependencies";
import { ProjectNameSchema } from "@bc-cr/schema/project-name";
import { JSONSchemaType } from "ajv";

export const DependenciesSchema: JSONSchemaType<Dependency[]> = {
  type: "array",
  items: {
    type: "object",
    properties: {
      project: ProjectNameSchema,
    },
    required: ["project"],
    additionalProperties: false,
  },
};
