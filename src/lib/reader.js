const fs = require("fs");

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
    : readDefinitionFileFromFile(file, options.urlPlaceHolders);
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
  definitionYaml.dependencies = await loadDependencies(
    definitionYaml.dependencies,
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
  definitionFileFolder,
  containerPath,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  let dependenciesFinalPath = dependencies;
  if (dependencies) {
    if (
      containerPath.startsWith("http") &&
      !Array.isArray(dependencies) &&
      !dependencies.startsWith("http")
    ) {
      const treatedUrl = treatUrl(containerPath, options.urlPlaceHolders);
      dependenciesFinalPath = `${treatedUrl.substring(
        0,
        treatedUrl.lastIndexOf("/")
      )}/${dependencies}`;
      const dependenciesContent = await getUrlContent(
        dependenciesFinalPath,
        options.token
      );
      fs.writeFileSync(dependencies, dependenciesContent);
    }

    if (!Array.isArray(dependencies)) {
      const dependenciesFilePath = dependencies.startsWith("http")
        ? treatUrl(dependencies, options.urlPlaceHolders)
        : `${definitionFileFolder}/${dependencies}`;
      const dependenciesFileContent = dependencies.startsWith("http")
        ? await getUrlContent(dependenciesFilePath, options.token)
        : fs.readFileSync(dependenciesFilePath, "utf8");
      const dependenciesYaml = readYaml(dependenciesFileContent);
      validateDependencies(dependenciesYaml);
      // Once the dependencies are loaded, the `extends` proporty is concatenated to the current dependencies
      return (
        await loadDependencies(
          dependenciesYaml.extends,
          dependenciesFilePath.substring(
            0,
            dependenciesFilePath.lastIndexOf("/")
          ),
          dependenciesFinalPath,
          options
        )
      ).concat(dependenciesYaml.dependencies);
    } else {
      // There's no extension for embedded dependencies
      return dependencies;
    }
  } else {
    return [];
  }
}

module.exports = { readDefinitionFile };
