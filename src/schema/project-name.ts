import { JSONSchemaType } from "ajv";

export const ProjectNameSchema: JSONSchemaType<string> = {
  type: "string",
  pattern: "^[^/]+/[^/]+$",
};
