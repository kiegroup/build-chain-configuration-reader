/**
 * it generates an ordered array of node's parents from top to bottom
 * @param {Object} node the node object with its parents and children
 * @param {Array} nodeList the nodeList to fill
 */
function parentChainFromNode(node) {
  const result = node.parents
    .reduce((acc, parent) => {
      acc.push(
        ...parentChainFromNode(parent)
          .filter(e => e && !acc.find(a => a.project === e.project))
          .map(e => {
            return { ...e };
          })
      );
      return acc;
    }, [])
    .filter(e => e);
  result.push(node);
  return result;
}

/**
 * it generates an ordered array of node's children from top to bottom
 * @param {Object} node the node object with its parents and children
 * @param {Array} nodeList the nodeList to fill
 */
function childChainFromNode(node, nodeList = []) {
  const index = nodeList.findIndex(n => n.project === node.project);
  if (index > -1) {
    nodeList.splice(index, 1);
  }
  nodeList.push(node);
  node.children.forEach(child => childChainFromNode(child, nodeList));
  return nodeList;
}

/**
 *
 * @param {String} key the JSON.stringify key
 * @param {Object} value the JSON.stringify value
 * @param {Array} cache an empty array instance
 */
function jsonStringFunction(key, value, cache) {
  {
    return ["parents", "children"].includes(key)
      ? value.map(node => {
          if (!cache.includes(node.project)) {
            cache.push(node.project);
            return node;
          }
          return {
            project: node.project,
            warning:
              "rest of the node information removed to avoid circular dependency problem. The node information is already defined in the json."
          };
        })
      : value;
  }
}

module.exports = {
  parentChainFromNode,
  childChainFromNode,
  jsonStringFunction
};
