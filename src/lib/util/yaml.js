const { ReadYamlException } = require("../exception/yaml-exception");
const yaml = require("js-yaml");

function read(fileContent) {
  try {
    return yaml.safeLoad(fileContent);
  } catch (e) {
    const errorMessage = `error reading yaml file content. Error: ${e.message}`;
    console.error(errorMessage);
    throw new ReadYamlException(errorMessage);
  }
}

module.exports = { read };
