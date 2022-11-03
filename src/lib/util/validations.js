const assert = require("assert");

const allowedVersions = ["2.1", "2.2"];

function validateDefinition(definition) {
  assert(
    definition,
    "definition file is empty or couldn't be loaded, please check 'definition-file' input"
  );
  validateVersion(definition.version, "definition");
}

function validateDependencies(dependencies) {
  validateVersion(dependencies.version, "dependencies");
}

function validateVersion(version, fileName) {
  assert(
    version,
    `version is not defined on ${fileName} file. Please add version: x, where x is one of these values ${allowedVersions}`
  );
  assert(
    allowedVersions.includes(version),
    `version ${version} is not allowed in ${fileName} file. Allowed versions: ${allowedVersions}`
  );
}

function validateNode(node) {
  assert(
    node,
    "node is undefined. Please check your definition file. For example, projects declared as a dependency for another project has to be already defined (I mean from order point of view)."
  );
  assert(
    node.project,
    "project can't be undefined, please properly define your file."
  );
  assert(
    node.project.split("/").length === 2,
    `project has to defined following \`group/project\` pattern (i.e. \`kiegroup/drools\`). "${node.project}" instead`
  );
}

module.exports = { validateDefinition, validateDependencies, validateNode };
