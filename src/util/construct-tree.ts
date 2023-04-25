import { Dependency } from "@bc-cr/domain/dependencies";
import { Build, BuildCommand } from "@bc-cr/domain/build";
import { Node } from "@bc-cr/domain/node";
import { constructNode } from "@bc-cr/util/construct-node";

export function constructTree(
  dependencies: Dependency[],
  defaultBuild?: BuildCommand,
  build?: Build[]
): Node[] {
  // construct a map where key is the project name and value is the constructed node
  // we are using a map for faster lookup
  const map = dependencies.reduce((map: Record<string, Node>, dependency) => {
    const node = constructNode(dependency, defaultBuild, build);
    if (node) {
      map[dependency.project] = node;
    }
    return map;
  }, {});

  return dependencies.reduce((roots: Node[], dependency) => {
    // if dependency does not have any parents then it is a root and
    // it is not skipped if the it is not undefined in the map
    if (isRoot(dependency) && map[dependency.project]) {
      roots.push(map[dependency.project]);
    } else {
      const parentDependencies = dependency.dependencies?.map(d => d.project) ?? [];
      parentDependencies.forEach(parentDependency => {
        // make sure the parent project has been defined
        if (!map[parentDependency]) {
          throw new Error(
            `The project ${parentDependency} does not exist on project list. Please review your project definition file`
          );
        }

        // add only if it was not skipped
        if (
          map[dependency.project] &&
          !reachableThroughOtherParents(dependencies, parentDependencies, parentDependency)
        ) {
          // add current dependency as child of the parentDependency
          map[parentDependency].children.push(map[dependency.project]);

          // store a reference of the parent in the child as well
          // using a string instead of Node to avoid circular dependency
          map[dependency.project].parents.push(map[parentDependency]);
        }
      });
    }
    // roots array contains nodes which don't have any parents
    // and are the "starting" point in the tree
    return roots;
  }, []);
}

function isRoot(dependency: Dependency): boolean {
  return !dependency.dependencies || dependency.dependencies.length === 0;
}

function reachableThroughOtherParents(dependencies: Dependency[], allParents: string[], parentToBeAdded: string) {
  for (const parent of allParents) {
    const grandparents = dependencies.find(d => d.project === parent)?.dependencies?.map(d => d.project);
    if (
      grandparents?.includes(parentToBeAdded) || 
      reachableThroughOtherParents(dependencies, grandparents ?? [], parentToBeAdded)
    ) {
      return true;
    }
  }
  return false;
}