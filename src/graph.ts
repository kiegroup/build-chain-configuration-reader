import { Dependency } from "@bc-cr/domain/dependencies";
import { Graph, Visited } from "@bc-cr/domain/graph";
import { ReaderOpts } from "@bc-cr/domain/readerOptions";
import { readDefinitionFile } from "@bc-cr/reader";
import { constructGraph } from "@bc-cr/util/construct-graph";
import { constructNode } from "@bc-cr/util/construct-node";

export async function getUpstreamProjects(
  definitionFileLocation: string,
  project: string,
  opts?: ReaderOpts) {
    const definitionFile = await readDefinitionFile(definitionFileLocation, opts);
    const graph = constructGraph(definitionFile.dependencies as Dependency[]);
    return dfs(project, graph, true)
    .map(
      p => constructNode(
        p, 
        definitionFile.default?.["build-command"], 
        definitionFile.build,
        graph[p.project].depth
      )
    );
}

export async function getFullDownstreamProjects(definitionFileLocation: string,
  project: string,
  opts?: ReaderOpts) {
    const definitionFile = await readDefinitionFile(definitionFileLocation, opts);
    const graph = constructGraph(definitionFile.dependencies as Dependency[]);
    return dfs(project, graph).map(
      p => constructNode(
        p, 
        definitionFile.default?.["build-command"], 
        definitionFile.build,
        graph[p.project].depth
      )
    );
}

/**
 * Depth First Search on a graph starting at a given project.
 * Additional Constraints: 
 *     For any node, visit all its outgoing edges before visiting incoming edges
 */
function dfs(project: string, graph: Graph, outgoingOnly = false) {
  const result: Dependency[] = [];
  const visited = Object.keys(graph).reduce((visited: Record<string, Visited>, curr: string) => {
    visited[curr] = Visited.VISITED_NONE;
    return visited;
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
 * 
 * We will also store depth of each vertex. 
 * Depth of a vertex is defined as the longest distance between the vertex and a root node (i.e. vertex with no outgoing edges or a source)
 */
function visitOutgoingEdges(project: string, graph: Graph, visited: Record<string, Visited>, result: Dependency[]) {
  // check whether node already has a temporary mark in which case we have a cycle that cant be resolved
  if (visited[project] === Visited.VISITING_OUTGOING) {
    throw new Error("Cycle detected");
  }

  // if the node has not already been visited
  if (visited[project] === Visited.VISITED_NONE) {
    // mark the node with a temporary mark
    visited[project] = Visited.VISITING_OUTGOING;

    let maxDepth = graph[project].depth;
    for (const dependency of graph[project].outgoing) {
      const currDepth = visitOutgoingEdges(dependency, graph, visited, result);
      if (currDepth > maxDepth) {
        maxDepth = currDepth;
      }
    }

    // update the depth of the current project
    graph[project].depth = maxDepth + 1;

    // mark the node with a permanent mark
    visited[project] = Visited.VISITED_OUTGOING;
    result.push(graph[project].dependency);
  }
  return graph[project].depth;
}

function visit(project: string, graph: Graph, visited: Record<string, Visited>, result: Dependency[]) {
  // before visiting the incoming edge of the current project, visit all its outgoing edges (i.e dependencies)
  visitOutgoingEdges(project, graph, visited, result);

  // if the node has not already been visited
  if (visited[project] !== Visited.VISITED_ALL) {
    // check whether node already has a temporary mark in which case we have a cycle that cant be resolved
    if (visited[project] === Visited.VISITING_INCOMING) {
      throw new Error("Cycle detected");
    }

    // mark the node with a temporary mark
    visited[project] = Visited.VISITING_INCOMING;

    for (const dependant of graph[project].incoming) {
      visit(dependant, graph, visited, result);
    }

    // mark the node with a permanent mark. no need to add it to result since visitOutgoingEdges already does that
    visited[project] = Visited.VISITED_ALL;
  }  
}
