const fs = require("fs");

const { getUrlContent } = require("./util/http");
const { treatUrl } = require("./util/reader-util");
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
async function readDefinitionFile(file, urlPlaceHolders = {}) {
  return file.startsWith("http")
    ? readDefinitionFileFromUrl(file, urlPlaceHolders)
    : readDefinitionFileFromFile(file, urlPlaceHolders);
}

/**
 * reads definition from a file and returns back the yaml object
 * @param {String} filePath the definition file path
 * @param {Object} urlPlaceHolders the url place holders to replace url
 */
async function readDefinitionFileFromFile(filePath, urlPlaceHolders) {
  const defintionFileContent = fs.readFileSync(filePath, "utf8");
  return loadYaml(
    readYaml(defintionFileContent),
    filePath.substring(0, filePath.lastIndexOf("/")),
    urlPlaceHolders
  );
}

/**
 * reads definition from a url and returns back the yaml object
 * @param {String} url the url to the definition file
 * @param {Object} urlPlaceHolders the url place holders to replace url
 */
async function readDefinitionFileFromUrl(url, urlPlaceHolders) {
  const treatedUrl = treatUrl(url, urlPlaceHolders);
  const definitionYaml = readYaml(await getUrlContent(treatedUrl));
  validateDefinition(definitionYaml);
  // In case the dependencies are defined as relative path we should download treating definition faile
  if (
    !Array.isArray(definitionYaml.dependencies) &&
    !definitionYaml.dependencies.startsWith("http")
  ) {
    const dependenciesContent = await getUrlContent(
      `${treatedUrl.substring(0, treatedUrl.lastIndexOf("/"))}/${
        definitionYaml.dependencies
      }`
    );
    fs.writeFileSync(definitionYaml.dependencies, dependenciesContent);
  }
  return loadYaml(definitionYaml, "./", urlPlaceHolders);
}

/**
 * it loads dependencies content from a external file/url and returns back the yaml object
 * @param {Object} definitionYaml the definition yaml object
 * @param {String} definitionFileFolder the definition folder path
 * @param {Object} urlPlaceHolders the url place holders to replace url
 */
async function loadYaml(definitionYaml, definitionFileFolder, urlPlaceHolders) {
  validateDefinition(definitionYaml);
  if (!Array.isArray(definitionYaml.dependencies)) {
    const dependenciesFileContent = definitionYaml.dependencies.startsWith(
      "http"
    )
      ? await getUrlContent(
          treatUrl(definitionYaml.dependencies, urlPlaceHolders)
        )
      : fs.readFileSync(
          `${definitionFileFolder}/${definitionYaml.dependencies}`,
          "utf8"
        );
    const dependenciesYaml = readYaml(dependenciesFileContent);
    validateDependencies(dependenciesYaml);
    definitionYaml.dependencies = dependenciesYaml.dependencies;
  }
  return definitionYaml;
}

module.exports = { readDefinitionFile };
