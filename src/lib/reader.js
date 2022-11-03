const fs = require("fs");
const path = require("path");

const { getUrlContent } = require("./util/http");
const { treatUrl, treatMapping } = require("./util/reader-util");
const {
  validateDefinition,
  validateDependencies
} = require("./util/validations");
const { read: readYaml } = require("./util/yaml");

/**
 * It will return back the definition file plus dependencies as an object
 *
 * @param {string} file - The definition file. It can be a URL or a in the filesystem.
 * @param {Object} urlPlaceHolders the url place holders to replace url. This is needed in case either the definition file or the dependencies file are loaded from a URL
 */
async function readDefinitionFile(
  file,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  return file.startsWith("http")
    ? readDefinitionFileFromUrl(file, options)
    : readDefinitionFileFromFile(file, options);
}

/**
 * reads definition from a file and returns back the yaml object
 * @param {String} filePath the definition file path
 * @param {Object} urlPlaceHolders the url place holders to replace url
 */
async function readDefinitionFileFromFile(
  filePath,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  const defintionFileContent = fs.readFileSync(filePath, "utf8");
  return loadYaml(
    readYaml(defintionFileContent),
    filePath.substring(0, filePath.lastIndexOf("/")),
    defintionFileContent,
    options
  );
}

/**
 * reads definition from a url and returns back the yaml object
 * @param {String} url the url to the definition file
 * @param {Object} urlPlaceHolders the url place holders to replace url
 */
async function readDefinitionFileFromUrl(
  url,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  const treatedUrl = treatUrl(url, options.urlPlaceHolders);

  return loadYaml(
    readYaml(await getUrlContent(treatedUrl, options.token)),
    "./",
    url,
    options
  );
}

/**
 * it loads dependencies content from a external file/url and returns back the yaml object
 * @param {Object} definitionYaml the definition yaml object
 * @param {String} definitionFileFolder the definition folder path
 * @param {String} containerPath the path or url where the container was loaded
 * @param {Object} urlPlaceHolders the url place holders to replace url
 */
async function loadYaml(
  definitionYaml,
  definitionFileFolder,
  containerPath,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  validateDefinition(definitionYaml);
  let extendedDefinitionFile;
  if (definitionYaml.extends) {
    const extendedDefinitionFileLocation = constructLocation(
      definitionYaml.extends,
      containerPath,
      definitionFileFolder,
      options
    );
    extendedDefinitionFile = await readDefinitionFile(
      extendedDefinitionFileLocation,
      options
    );
    delete definitionYaml["extends"];
  }
  definitionYaml.pre = extendPrePost(
    definitionYaml.pre,
    extendedDefinitionFile?.pre
  );
  definitionYaml.post = extendPrePost(
    definitionYaml.post,
    extendedDefinitionFile?.post
  );
  definitionYaml.default = extendDefault(
    definitionYaml.default,
    extendedDefinitionFile?.default
  );
  definitionYaml.build = extendBuild(
    definitionYaml.build,
    extendedDefinitionFile?.build
  );
  definitionYaml.dependencies = await loadDependencies(
    definitionYaml.dependencies,
    extendedDefinitionFile?.dependencies,
    definitionFileFolder,
    containerPath,
    options
  );
  if (definitionYaml.dependencies) {
    definitionYaml.dependencies
      .filter(dependency => dependency.mapping)
      .map(dependency => dependency.mapping)
      .forEach(mapping => treatMapping(mapping));
  }
  return definitionYaml;
}

/**
 *
 * @param {Array|String} dependencies is the dependencies/extends property of the file, it can be an Array or a file path/URL
 * @param {*} definitionFileFolder the folder
 * @param {*} containerPath
 * @param {*} urlPlaceHolders
 */
async function loadDependencies(
  dependencies,
  extendedDependencies,
  definitionFileFolder,
  containerPath,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  if (!dependencies) {
    return [];
  }

  let loadedDependencies = dependencies;

  // if dependencies weren't embedded then load it from file or url
  if (!Array.isArray(dependencies)) {
    let dependenciesLocation = constructLocation(
      dependencies,
      containerPath,
      definitionFileFolder,
      options
    );
    const dependenciesYaml = await readDefinitionFile(
      dependenciesLocation,
      options
    );
    validateDependencies(dependenciesYaml);
    loadedDependencies = dependenciesYaml.dependencies;
  }

  // extend loaded dependencies if needed
  return extendedDependencies
    ? extendedDependencies.concat(loadedDependencies)
    : loadedDependencies;
}

function extendBuild(current, extendWith) {
  if (!extendWith) {
    return current;
  }

  if (!current) {
    return extendWith;
  }

  const copyCurrent = [...current];

  extendWith.map(parent => {
    // only add if it doesn't exist in the current build. current build overrides parent
    if (!current.find(current => current.project === parent.project)) {
      copyCurrent.push(parent);
    }
  });

  return copyCurrent;
}

function extendDefault(current, extendWith) {
  if (!extendWith) {
    return current;
  }

  if (!current) {
    return extendWith;
  }

  const copyCurrent = { ...current };
  const currentKeys = Object.keys(current);

  Object.entries(extendWith).forEach(([key, value]) => {
    if (typeof value === "object") {
      // if current as the key then merge the 2 objects otherwise use the object from extended
      copyCurrent[key] = currentKeys.includes(key)
        ? extendDefault(current[key], value)
        : value;
    } else {
      // override extended definition file's value with the current one
      copyCurrent[key] = current[key] ?? value;
    }
  });
  return copyCurrent;
}

function extendPrePost(current, extendWith) {
  if (!extendWith) {
    return current;
  }

  if (!current) {
    return extendWith;
  }

  return `${current}\n${extendWith}`;
}

function constructLocation(location, containerPath, parentDir, options) {
  if (location.startsWith("http")) {
    return treatUrl(location, options.urlPlaceHolders);
  }
  // if location is a file path and container path was a url
  else if (containerPath.startsWith("http")) {
    const treatedContainerUrl = treatUrl(
      containerPath,
      options.urlPlaceHolders
    );
    return `${treatedContainerUrl.substring(
      0,
      treatedContainerUrl.lastIndexOf("/")
    )}/${location}`;
  } else {
    return path.join(parentDir, location);
  }
}

module.exports = { readDefinitionFile };
