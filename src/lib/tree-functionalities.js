const { getTree, getTreeForProject } = require("./project-tree");
const { parentChainFromNode } = require("./util/chain-util");

/**
 * Gets a plain node list of projects ordered by precedence
 * @param {string} file - The definition file. It can be a URL or a in the filesystem.
 * @param {string} project - The project name to look for.
 */
async function getOrderedListForTree(
  file,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  const tree = await getTree(file, options);
  return getOrderedList(tree);
}

/**
 * Gets a plain node list of projects ordered by precedence for a specific project
 * @param {string} file - The definition file. It can be a URL or a in the filesystem.
 * @param {string} project - The project name to look for.
 */
async function getOrderedListForProject(
  file,
  project,
  options = { urlPlaceHolders: {}, token: undefined }
) {
  const tree = await getTreeForProject(file, project, options);
  return getOrderedList([tree]);
}

/**
 * Gets a plain node list of projects ordered by precedence
 * @param {string} tree - The tree to iterate
 */
async function getOrderedList(tree) {
  const finalLeaves = getFinalLeavesFromTree(tree);
  return finalLeaves
    .map(leaf => parentChainFromNode(leaf))
    .sort((a, b) => b.length - a.length)
    .reduce((acc, chain) => {
      acc.push(
        ...chain.filter(c => !acc.map(e => e.project).includes(c.project))
      );
      return acc;
    }, []);
}

/**
 * It returns back the final leaves from a tree
 * @param {Array} nodes the array of nodes
 * @param {Array} latestLeavesFromTree
 * @param {Array} allreadyVisitedNodes
 */
function getFinalLeavesFromTree(
  nodes,
  latestLeavesFromTree = [],
  allreadyVisitedNodes = []
) {
  if (nodes && nodes.length > 0) {
    const allreadyVisitedPreviousNodes = [...allreadyVisitedNodes];
    const notIncludedChildren = nodes
      .filter(node => !allreadyVisitedPreviousNodes.includes(node.project))
      .reduce((acc, e) => {
        acc.push(
          ...e.children.filter(
            child => !acc.map(e => e.project).includes(child.project)
          )
        );
        return acc;
      }, []);
    allreadyVisitedNodes.push(...nodes.map(e => e.project));
    getFinalLeavesFromTree(
      notIncludedChildren,
      latestLeavesFromTree,
      allreadyVisitedNodes
    );

    latestLeavesFromTree.push(
      ...nodes.filter(
        node =>
          (!node.children || node.children.length === 0) &&
          !latestLeavesFromTree.map(e => e.project).includes(node.project)
      )
    );

    return latestLeavesFromTree;
  } else {
    return [];
  }
}

module.exports = {
  getOrderedListForProject,
  getOrderedListForTree,
  getOrderedList
};
