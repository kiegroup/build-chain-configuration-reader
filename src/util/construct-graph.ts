import { Dependency } from "@bc-cr/domain/dependencies";
import { Graph, Visited } from "@bc-cr/domain/graph";

export function constructGraph(
  dependencies: Dependency[],
) {
  /**
   * restructure dependencies into a map (directed adjacency list graph):
   * key = project name
   * value = array of project names which it depends on
   */ 
  const initializedGraph = dependencies.reduce((ig: Graph, current) => {
    initializeVertex(current, ig);
    return ig;
  }, {});

  const graph = dependencies.reduce((g: Graph, current) => {
    current.dependencies?.forEach(parent => {
      // make sure the dependency was actually defined
      if (!g[parent.project]) {
        throw new Error("parent does not exist");
      }
      
      // each dependency of a project is added to the outgoing edges of the project
      g[current.project].outgoing.add(parent.project);

      // for each dependency, the project is added to the incoming edges
      g[parent.project].incoming.add(current.project);
    });
    return g;
  }, initializedGraph);

  return graph;
}

/**
 * Depth First Search on a graph starting at a given project.
 * Additional Constraints: 
 *     For any node, visit all its outgoing edges before visiting incoming edges
 */
export function DFS(project: string, graph: Graph, outgoingOnly = false) {
  const result: Dependency[] = [];
  const visited = Object.keys(graph).reduce((v: Record<string, Visited>, curr) => {
    v[curr] = Visited.VISITED_NONE;
    return v;
  }, {});
  if (outgoingOnly) {
    visitOutgoingEdges(project, graph, visited, result);
  } else {
    visit(project, graph, visited, result);
  }
  return result;
}

/**
 * DFS on only outgoing edges. We essentially want a topological sort
 * src: https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
 */
function visitOutgoingEdges(project: string, graph: Graph, visited: Record<string, Visited>, result: Dependency[]) {
  // check whether node already has a temporary mark in which case we have a cycle that cant be resolved
  if (visited[project] === Visited.VISITING_OUTGOING) {
    throw new Error("Cycle detected");
  }

  // if the node has already been visited
  if (visited[project] !== Visited.VISITED_NONE) {
    return;
  }

  // mark the node with a temporary mark
  visited[project] = Visited.VISITING_OUTGOING;

  for (const dependency of graph[project].outgoing) {
    visitOutgoingEdges(dependency, graph, visited, result);
  }

  // mark the node with a permanent mark
  visited[project] = Visited.VISITED_OUTGOING;
  result.push(graph[project].dependency);
}

function visit(project: string, graph: Graph, visited: Record<string, Visited>, result: Dependency[]) {
  // DFS on outgoing edges first
  visitOutgoingEdges(project, graph, visited, result);

  // if the node has already been visited
  if (visited[project] === Visited.VISITED_ALL) {
    return;
  }

  // check whether node already has a temporary mark in which case we have a cycle that cant be resolved
  if (visited[project] === Visited.VISITING_INCOMING) {
    throw new Error("Cycle detected");
  }

  // mark the node with a temporary mark
  visited[project] = Visited.VISITING_INCOMING;

  for (const dependant of graph[project].incoming) {
    // before visiting the incoming edge of the current dependant, visit all its outgoing edges (i.e dependencies)
    visitOutgoingEdges(dependant, graph, visited, result);
    visit(dependant, graph, visited, result);
  }

  // mark the node with a permanent mark. no need to add it to result since visitOutgoingEdges already does that
  visited[project] = Visited.VISITED_ALL;
}

function initializeVertex(dependency: Dependency, graph: Graph) {
  if (!graph[dependency.project]) {
    graph[dependency.project] = {
      incoming: new Set(),
      outgoing: new Set(),
      dependency
    };
  }
}



