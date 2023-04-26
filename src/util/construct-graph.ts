import { Dependency } from "@bc-cr/domain/dependencies";
import { Graph } from "@bc-cr/domain/graph";

export function constructGraph(
  dependencies: Dependency[],
) {
  /**
   * restructure dependencies into a map (directed adjacency list graph):
   * key = project name
   * value = array of project names which it depends on
   */ 
  const initializedGraph = dependencies.reduce((initialGraph: Graph, current: Dependency) => {
    initializeVertex(current, initialGraph);
    return initialGraph;
  }, {});

  const graph = dependencies.reduce((graph: Graph, current: Dependency) => {
    current.dependencies?.forEach(parent => {
      // make sure the dependency was actually defined
      if (!graph[parent.project]) {
        throw new Error(`The project ${parent.project} does not exist on project list. Please review your project definition file`);
      }
      
      // each dependency of a project is added to the outgoing edges of the project
      graph[current.project].outgoing.add(parent.project);

      // for each dependency, the project is added to the incoming edges
      graph[parent.project].incoming.add(current.project);
    });
    return graph;
  }, initializedGraph);

  return graph;
}

function initializeVertex(dependency: Dependency, graph: Graph) {
  if (!graph[dependency.project]) {
    graph[dependency.project] = {
      incoming: new Set(),
      outgoing: new Set(),
      dependency,
      depth: -1
    };
  }
}



