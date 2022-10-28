import { Dependency } from "@bc-cr/domain/dependencies";
import { Depend } from "@bc-cr/domain/mapping";
import { safeEval } from "@bc-cr/util/safe-eval";
import { treatUrl } from "@bc-cr/util/treat-url";
import { validateDefinitionFile } from "@bc-cr/util/yaml";
import { readFile } from "fs/promises";
import axios from "axios";
import path from "path";
import { ReaderOpts } from "@bc-cr/domain/readerOptions";

/**
 * Read the definition file from the given location, validate it and generate a DefinitionFile object
 * containing all the required information.
 * You do need to treat the url and pass it as location. This function does that for you
 * @param location
 * @param opts
 * @returns
 */
export async function readDefinitionFile(
  location: string,
  opts?: ReaderOpts,
) {
  try {
    const definitionFileContent = await getContent(
      location,
      opts
    );
    const definitionFile = await validateDefinitionFile(definitionFileContent);
    const baseDir = isURL(location) ? undefined : path.dirname(location);
    if (typeof definitionFile.dependencies === "string") {
      definitionFile.dependencies = await getDependencies(
        definitionFile.dependencies,
        baseDir,
        opts
      );
    }
    if (definitionFile.extends) {
      definitionFile.dependencies = [
        ...definitionFile.dependencies,
        ...(await getDependencies(
          definitionFile.extends,
          baseDir,
          opts
        )),
      ];
      delete definitionFile["extends"];
    }
    targetExpressionToTarget(definitionFile.dependencies);
    return definitionFile;
  } catch (err) {
    throw new Error(`Error getting ${location}. Error: ${JSON.stringify(err)}`);
  }
}

/**
 * Get's dependencies only from the given location
 * Throws an error if the file at the given location, also reads the dependency file from another location.
 * This is done because nested reading of dependency file is redundant. See below:
 * If A -> B -> C (if A gets dependency file from B and B gets dependency file from C) then we can
 * simplify this to A -> C
 * @param location
 * @param opts
 * @returns
 */
async function getDependencies(
  location: string,
  baseDir?: string,
  opts?: ReaderOpts,
) {
  const content = await getContent(
    isURL(location) ? location : path.resolve(baseDir ?? "", location),
    opts
  );
  const dependencies = await validateDefinitionFile(content);
  if (typeof dependencies.dependencies === "string") {
    throw new Error(
      "Nested references to another dependencies file is redundant. Please directly use the location of the dependencies file that is needed"
    );
  }
  return dependencies.dependencies;
}

/**
 * Loads the content of a file from the given location.
 * If the file is url it will make a GET request to read it
 * If the file is file location it assumes that the location is with respect to
 * @param location
 * @param token
 * @param group
 * @param name
 * @param branch
 * @returns
 */
async function getContent(
  location: string,
  opts?: ReaderOpts
): Promise<string> {
  if (isURL(location)) {
    const url = treatUrl(location, opts?.group, opts?.name, opts?.branch);
    const response = await axios.get(url, {
      responseType: "text",
      ...(opts?.token ? { headers: { Authorization: `Bearer ${opts.token}` } } : {}),
    });
    return response.data;
  } else {
    return readFile(location, "utf8");
  }
}

function isURL(str: string) {
  const urlRegex = /^https?:\/\//;
  return urlRegex.test(str);
}

/**
 * Converts all targetExpression to target by executing the given expression
 * @param dependencies
 */
function targetExpressionToTarget(dependencies: Dependency[]) {
  for (const dependency of dependencies) {
    if (dependency.mapping?.dependant) {
      executeTargetExpression(dependency.mapping.dependant);
    }

    if (dependency.mapping?.dependencies) {
      executeTargetExpression(dependency.mapping.dependencies);
    }
  }
}

/**
 * Executes the targetExpression for each SourceToTarget object
 * @param depend
 */
function executeTargetExpression(depend: Depend) {
  for (const [key, value] of Object.entries(depend)) {
    depend[key] = value.map(stt =>
      stt.targetExpression
        ? {
            source: stt.source,
            target: safeEval(stt.targetExpression, stt) as string,
          }
        : stt
    );
  }
}
