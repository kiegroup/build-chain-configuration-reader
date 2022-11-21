import { Dependency } from "@bc-cr/domain/dependencies";
import { Depend } from "@bc-cr/domain/mapping";
import { safeEval } from "@bc-cr/util/safe-eval";
import { treatUrl } from "@bc-cr/util/treat-url";
import { validateDefinitionFile } from "@bc-cr/util/yaml";
import { readFile } from "fs/promises";
import axios from "axios";
import path from "path";
import { ReaderOpts } from "@bc-cr/domain/readerOptions";
import { Build } from "@bc-cr/domain/build";
import { DefinitionFile } from "@bc-cr/domain/definition-file";
import { Post, Pre } from "@bc-cr/domain/pre-post";

/**
 * Read the definition file from the given location, validate it and generate a DefinitionFile object
 * containing all the required information.
 * You do need to treat the url and pass it as location. This function does that for you
 * @param location
 * @param opts
 * @returns
 */
export async function readDefinitionFile(location: string, opts?: ReaderOpts) {
  try {
    const definitionFileContent = await getContent(location, opts);
    const definitionFile = await validateDefinitionFile(definitionFileContent);

    let extendedDefinitionFile: DefinitionFile | undefined = undefined;
    if (definitionFile.extends) {
      extendedDefinitionFile = await readDefinitionFile(
        constructLocation(definitionFile.extends, location, opts),
        opts
      );
      delete definitionFile["extends"];
    }

    definitionFile.pre = extendPre(
      definitionFile.pre,
      extendedDefinitionFile ? extendedDefinitionFile.pre : undefined
    );
    definitionFile.post = extendPost(
      definitionFile.post,
      extendedDefinitionFile ? extendedDefinitionFile.post : undefined
    );
    definitionFile.default = extendDefault(
      definitionFile.default,
      extendedDefinitionFile ? extendedDefinitionFile.default : undefined
    );
    definitionFile.build = extendBuild(
      definitionFile.build,
      extendedDefinitionFile ? extendedDefinitionFile.build : undefined
    );

    definitionFile.dependencies = await loadDependencies(
      definitionFile.dependencies,
      extendedDefinitionFile?.dependencies as Dependency[] | undefined,
      location,
      opts
    );

    targetExpressionToTarget(definitionFile.dependencies);
    return definitionFile;
  } catch (err) {
    throw new Error(`Error getting ${location}. Error: ${JSON.stringify(err)}`);
  }
}

async function loadDependencies(
  dependencies: string | Dependency[] | undefined,
  extendedDependencies: Dependency[] | undefined,
  parentLocation: string,
  opts?: ReaderOpts
) {
  let loadedDependencies: Dependency[] = [];

  if (!dependencies) {
    return extendedDependencies ?? [];
  }

  // if dependencies weren't embedded then load it from file or url
  if (!Array.isArray(dependencies)) {
    const dependenciesLocation = constructLocation(
      dependencies,
      parentLocation,
      opts
    );
    const dependenciesYaml = await readDefinitionFile(
      dependenciesLocation,
      opts
    );
    loadedDependencies = dependenciesYaml.dependencies as Dependency[];
  } else {
    loadedDependencies = dependencies;
  }

  // extend loaded dependencies if needed
  return extendedDependencies
    ? extendedDependencies.concat(loadedDependencies)
    : loadedDependencies;
}

function extendBuild(current?: Build[], extendWith?: Build[]) {
  if (!extendWith) {
    return current;
  }

  if (!current) {
    return extendWith;
  }

  return [...current, ...extendWith.filter(parent => !current.find(current => current.project === parent.project))];
}

function extendDefault<T extends object>(current?: T, extendWith?: T) {

  if (!extendWith) {
    return current;
  }

  if (!current) {
    return extendWith;
  }

  const currentKeys = Object.keys(current);

  return Object.entries(extendWith).reduce((acc, [key, value]) => {
    const currentValue = current[key as keyof T];
    if (Array.isArray(value) && Array.isArray(currentValue)) {
      acc[key as keyof T] = currentValue.length ? currentValue : value as T[keyof T];
    } else if (typeof value === "object") {
      // if current as the key then merge the 2 objects otherwise use the object from extended
      acc[key as keyof T] = currentKeys.includes(key)
        ? extendDefault(current[key as keyof T] as Build, value)
        : value;
    } else {
      // override extended definition file's value with the current one
      acc[key as keyof T] = current[key as keyof T] ?? value;
    }
    return acc;
  }, { ...current });
}

function extendPre(current?: Pre, extendWith?: Pre) {
  if (!extendWith) {
    return current;
  }

  if (!current) {
    return extendWith;
  }

  return current.concat(extendWith);
}

function extendPost(current?: Post, extendWith?: Post) {
  if (!extendWith) {
    return current;
  }

  if (!current) {
    return extendWith;
  }

  return {
    success: extendPre(current.success, extendWith.success),
    always: extendPre(current.always, extendWith.always),
    failure: extendPre(current.failure, extendWith.failure),
  };
}

/**
 * Loads the content of a file from the given location.
 * If the file is url it will make a GET request to read it
 * If the file is file location it assumes that the location is with respect to
 * @param location
 * @param opts
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
      ...(opts?.token
        ? { headers: { Authorization: `Bearer ${opts.token}` } }
        : {}),
    });
    return response.data;
  } else {
    return readFile(location, "utf8");
  }
}

function constructLocation(
  currentLocation: string,
  parentLocation: string,
  opts?: ReaderOpts
) {
  if (isURL(currentLocation)) {
    return treatUrl(currentLocation, opts?.group, opts?.name, opts?.branch);
  }
  // if current location is a file path and parent location was a url
  else if (isURL(parentLocation)) {
    const treatedParentUrl = treatUrl(
      parentLocation,
      opts?.group,
      opts?.name,
      opts?.branch
    );
    const lastSlash = treatedParentUrl.lastIndexOf("/");
    return `${treatedParentUrl.slice(0, lastSlash)}/${currentLocation}`;
  } else {
    return path.join(path.dirname(parentLocation), currentLocation);
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
