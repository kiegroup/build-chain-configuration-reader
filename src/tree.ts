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

function lookForProject(tree: Node[], project: string): Node | undefined {
  return (
    tree.find(node => node.project === project) ??
    tree
      .map(node => lookForProject(node.children, project))
      .find(node => !!node)
  );
}
