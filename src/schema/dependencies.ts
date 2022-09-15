import { ProjectNameSchema } from "@bc-cr/schema/project-name";

export const DependenciesSchema = {
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
