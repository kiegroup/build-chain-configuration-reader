const { readDefinitionFile } = require("./reader");
const { treatProject } = require("./helper/definition-interpreter");
const { validateNode } = require("./util/validations");

/**
 * It will return back the definition tree plus dependencies as an object.
 *
 * @param {string} file - The definition file. It can be a URL or a in the filesystem.
 * @param {Object} urlPlaceHolders the url place holders to replace url. This is needed in case either the definition file or the dependencies file are loaded from a URL
 */
async function getTree(
  file,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  const definition = await readDefinitionFile(file, options);
  return dependencyListToTree(definition.dependencies, definition);
}

/**
 * It will return back the definition tree plus dependencies as an object for a particular project.
 *
 * @param {string} file - The definition file. It can be a URL or a in the filesystem.
 * @param {string} project - The project name to look for.
 * @param {Object} urlPlaceHolders the url place holders to replace url. This is needed in case either the definition file or the dependencies file are loaded from a URL
 */
async function getTreeForProject(
  file,
  project,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  return lookForProject(await getTree(file, options), project);
}

/**
 * It returns the leaf from the tree corresponding to the project name
 * @param {Object} tree
 * @param {String} project the project name
 */
function lookForProject(tree, project) {
  if (tree && tree.length > 0) {
    const leaf = tree.find(leaf => project === leaf.project);
    return leaf
      ? leaf
      : tree
          .map(leaf => lookForProject(leaf.children, project))
          .find(child => child);
  } else {
    return undefined;
  }
}

/**
 * it treats the dependenciy list together with the build configuration to compose the build tree
 * @param {Object} dependencyList the dependency list
 * @param {Object} buildConfiguration the build configuration directly read from the yaml file
 */
function dependencyListToTree(dependencyList, buildConfiguration) {
  const map = dependencyList.reduce((map, dependency, i) => {
    map[dependency.project] = { index: i, node: undefined };
    dependency.children = [];
    dependency.parents = [];
    return map;
  }, {});

  return dependencyList.reduce((roots, node) => {
    validateNode(node);
    map[node.project].node = {
      ...node,
      repo: {
        group: node.project.split("/")[0],
        name: node.project.split("/")[1]
      },
      ...treatProject(node.project, buildConfiguration)
    };

    if (node.dependencies && node.dependencies.length > 0) {
      node.dependencies.forEach(dependency => {
        if ([null, undefined].includes(map[dependency.project])) {
          const errorMessage = `The project ${dependency.project} does not exist on project list. Please review your project definition file`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        dependencyList[map[dependency.project].index].children.push({
          ...map[node.project].node
        });
        node.parents.push({
          ...map[dependency.project].node
        });
      });
    } else {
      roots.push(map[node.project].node);
    }
    return roots;
  }, []);
}

module.exports = {
  getTree,
  getTreeForProject,
  dependencyListToTree
};
