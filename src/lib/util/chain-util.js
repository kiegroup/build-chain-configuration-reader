/**
 *
 * @param {object} the tree node with its parents and children
 * @param {Set} the set to interate
 */
function parentChainFromNode(node, nodeList = []) {
  if (!nodeList.map(n => n.project).includes(node.project)) {
    node.parents.forEach(parent => parentChainFromNode(parent, nodeList));
    nodeList.push(node);
  }
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

module.exports = { parentChainFromNode, jsonStringFunction };
