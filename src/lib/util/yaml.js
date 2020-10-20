const { ReadYamlException } = require("../exception/yaml-exception");
const yaml = require("js-yaml");

function read(fileContent) {
  try {
    return yaml.safeLoad(fileContent);
  } catch (e) {
    throw new ReadYamlException(
      `error reading yaml file content. Error: ${e.message}`
    );
  }
}

module.exports = { read };
