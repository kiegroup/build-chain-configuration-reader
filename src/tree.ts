import { Dependency } from "@bc-cr/domain/dependencies";
import { Node } from "@bc-cr/domain/node";
import { ReaderOpts } from "@bc-cr/domain/readerOptions";
import { readDefinitionFile } from "@bc-cr/reader";
import { constructTree } from "@bc-cr/util/construct-tree";

export async function getTree(
  definitionFileLocation: string,
  opts?: ReaderOpts
): Promise<Node[]> {
  const definitionFile = await readDefinitionFile(definitionFileLocation, opts);
  return constructTree(
    definitionFile.dependencies as Dependency[], // readDefinitionFile ensures this is true but we need this so ts does not complain
    definitionFile.default?.["build-command"],
    definitionFile.build
  );
}

export async function getTreeForProject(
  definitionFileLocation: string,
  project: string,
  opts?: ReaderOpts
): Promise<Node | undefined> {
  const tree = await getTree(definitionFileLocation, opts);
  return lookForProject(tree, project);
}

export function parentChainFromNode(node: Node): Node[] {
  const result = node.parents.reduce((parents: Node[], parent: Node) => {
    parents.push(
      ...parentChainFromNode(parent).filter(
        p => !parents.find(e => p.project === e.project)
      )
    );
    return parents;
  }, []);
  result.push(node);
  return result;
}

export async function getOrderedListForProject(
  definitionFileLocation: string,
  project: string,
  opts?: ReaderOpts
) {
  const node = await getTreeForProject(definitionFileLocation, project, opts);
  if (!node) {
    throw new Error(`Project ${project} not found`);
  }
  return getOrderedList(node);
}

export async function getOrderedListForTree(
  definitionFileLocation: string,
  opts?: ReaderOpts
) {
  const tree = await getTree(definitionFileLocation, opts);
  const result: Node[] = [];
  flattenTreeTopToBottom(tree, result);
  return result;
}

function lookForProject(tree: Node[], project: string): Node | undefined {
  return (
    tree.find(node => node.project === project) ??
    tree
      .map(node => lookForProject(node.children, project))
      .find(node => !!node)
  );
}

function flattenTreeTopToBottom(currentLevel: Node[], result: Node[]) {
  // base case
  if (currentLevel.length === 0) {
    return;
  }
  const nextLevel: Node[] = [];

  currentLevel.forEach(node => {
    const parentInResult = node.parents.every(parent =>
      result.find(res => res.project === parent.project)
    );

    // ensure that you are not duplicating a node and are only adding it after all it's parents have been added
    if (!result.find(res => res.project === node.project) && parentInResult) {
      result.push(node);
    }

    // don't have to filter out duplicate nodes as they will automatically be filtered out in results
    nextLevel.push(...node.children);

    if (!parentInResult) {
      nextLevel.push(node);
    }
  });
  flattenTreeTopToBottom(nextLevel, result);
}

/**
 * Gets a plain node list of projects ordered by precedence
 * @param {string} node - The node to iterate
 */
async function getOrderedList(node: Node) {
  const finalLeaves = getFinalLeavesFromTree([node]);
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
 * @param {Array} alreadyVisitedNodes
 */
function getFinalLeavesFromTree(
  nodes: Node[],
  latestLeavesFromTree: Node[] = [],
  alreadyVisitedNodes: string[] = []
) {
  if (nodes && nodes.length > 0) {
    const alreadyVisitedPreviousNodes = [...alreadyVisitedNodes];
    const notIncludedChildren = nodes
      .filter(node => !alreadyVisitedPreviousNodes.includes(node.project))
      .reduce((acc: Node[], e) => {
        acc.push(
          ...e.children.filter(
            child => !acc.map(e => e.project).includes(child.project)
          )
        );
        return acc;
      }, []);
    alreadyVisitedNodes.push(...nodes.map(e => e.project));
    getFinalLeavesFromTree(
      notIncludedChildren,
      latestLeavesFromTree,
      alreadyVisitedNodes
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
