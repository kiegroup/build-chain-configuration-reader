import { parse } from "yaml";
import Ajv from "ajv";
import { DefintionFileSchema } from "@bc-cr/schema/definition-file";

/**
 * Reads yaml and validates it against the schema
 * @param content 
 * @returns 
 */
export async function validateDefinitionFile(content: string) {
  // parse yaml and perform some transformation on the raw json produced
  const rawJSON = parse(content, reviver);
  const ajv = new Ajv({ useDefaults: "empty", allowUnionTypes: true });
  const validate = ajv.compile(DefintionFileSchema);
  const valid = validate(rawJSON);
  if (valid) {
    return rawJSON;
  } else {
    throw new Error(JSON.stringify(validate.errors));
  }
}

/**
 * A reviver function to transform json keys
 * @param key 
 * @param value 
 * @returns 
 */
function reviver(key: unknown, value: unknown) {
  let result;

  if ((result = convertToArray(key, value))) {
    return result;
  }

  if ((result = parseMapping(key, value))) {
    return result;
  }

  if ((result = parseBuild(key, value))) {
    return result;
  }

  if ((result = parseArchiveArtifacts(key, value))) {
    return result;
  }

  return value;
}

/**
 * Converts a string to an array of string
 * @param key 
 * @param value 
 * @returns 
 */
function convertToArray(key: unknown, value: unknown) {
  // for all the below keys, if the value is a string, split it at "\n" and convert to array
  if (
    ["path", "current", "upstream", "downstream"].includes(key as string) &&
    typeof value === "string"
  ) {
    return value.trim().split("\n");
  }
}

/**
 * If the given key is not present in the value then initialize it with init
 * @param key 
 * @param value 
 * @param init 
 * @returns 
 */
function initializeUndefined(
  key: string,
  value: Record<string, unknown>,
  init: unknown
) {
  if (!value[key]) {
    value[key] = init;
  }
  return value;
}

/**
 * Parse the mapping section of definition file
 * @param key 
 * @param value 
 * @returns 
 */
function parseMapping(key: unknown, value: unknown) {
  if (key === "mapping") {
    const val = value as Record<string, Record<string, unknown>>;
    // if exclude is not defined in mapping then add an empty array
    initializeUndefined("exclude", val, []);

    // if dependencies.default is not defined in mapping then add an empty array
    if (val["dependencies"]) {
      initializeUndefined("default", val["dependencies"], []);
    }

    // if dependant.default is not defined in mapping then add an empty array
    if (val["dependant"]) {
      initializeUndefined("default", val["dependant"], []);
    }
    return val;
  }
}

/**
 * Parse the build-command section of the definition file
 * @param key 
 * @param value 
 * @returns 
 */
function parseBuild(key: unknown, value: unknown) {
  // for any of the keys below, if they don't contain "upstream", "current" or "downstream" keys then initialize them to an empty array
  if (["before", "after", "build-command"].includes(key as string)) {
    const val = value as Record<string, unknown>;
    ["upstream", "downstream", "current"].forEach(k => {
      initializeUndefined(k, val, []);
    });
    return val;
  }
}

/**
 * Parse the archive artifacts section of the definition file
 * @param key 
 * @param value 
 * @returns 
 */
function parseArchiveArtifacts(key: unknown, value: unknown) {
  if (key === "archive-artifacts") {
    const val = value as Record<string, unknown>;
    // if dependencies is not defined in archive-artifacts then use none by default
    initializeUndefined("dependencies", val, "none");

    // transform array of path to array of path and on (on determines when the artifact is to be uploaded)
    if (val["path"] && Array.isArray(val["path"])) {
      val["paths"] = val.path.map(p => {
        if (typeof p === "string") {
          const index = p.lastIndexOf("@");
          return {
            path: index === -1 ? p : p.slice(0, index),
            on: index === -1 ? "success" : p.slice(index),
          };
        }
      });
      delete val["path"];
    }

    return val;
  }
}
