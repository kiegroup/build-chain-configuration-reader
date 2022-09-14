import { parse } from "yaml";
import Ajv from "ajv";
import { DefintionFileSchema } from "@bc-cr/schema/definition-file-schema";

export async function loadDefinitionFile(content: string) {
  // parse yaml and perform some transformation on the raw json produced
  const rawJSON = parse(content, (key: unknown, value: unknown) => {
    // for all the below keys, if the value is a string, split it at "\n" and convert to array
    const keys = ["path", "current", "upstream", "downstream"];
    if (keys.includes(key as string) && typeof value === "string") {
      return value.trim().split("\n");
    }

    if (key === "mapping") {
      const val = value as Record<string, Record<string, unknown>>;
      // if exclude is not defined in mapping then add an empty array
      if (!val["exclude"]) {
        return {
          ...val,
          exclude: [],
        };
      }
      // if dependencies.default is not defined in mapping then add an empty array
      if (val["dependencies"] && !val["dependencies"]["default"]) {
        return {
          ...val,
          dependencies: {
            ...val["dependencies"],
            default: [],
          },
        };
      }
      // if dependant.default is not defined in mapping then add an empty array
      if (val["dependant"] && !val["dependant"]["default"]) {
        return {
          ...val,
          dependant: {
            ...val["dependant"],
            default: [],
          },
        };
      }
    }
    if (key === "archive-artifacts") {
      const val = value as Record<string, unknown>;
      // if dependencies is not defined in archive-artifacts then use none by default
      if (!val["dependencies"]) {
        return {
          ...val,
          dependencies: "none",
        };
      }
    }
    return value;
  });
  const ajv = new Ajv({ useDefaults: "empty" });
  const validate = ajv.compile(DefintionFileSchema);
  const valid = validate(rawJSON);
  if (valid) {
    return rawJSON;
  } else {
    throw new Error(JSON.stringify(validate.errors));
  }
}
