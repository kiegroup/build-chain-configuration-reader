import { Dependency } from "@bc-cr/domain/dependencies";
import { ReaderOpts } from "@bc-cr/domain/readerOptions";
import { readDefinitionFile } from "@bc-cr/reader";
import { constructGraph, DFS } from "@bc-cr/util/construct-graph";
import { constructNode } from "@bc-cr/util/construct-node";

export async function getUpstreamProjects(
  definitionFileLocation: string,
  project: string,
  opts?: ReaderOpts) {
    const definitionFile = await readDefinitionFile(definitionFileLocation, opts);
    const graph = constructGraph(definitionFile.dependencies as Dependency[]);
    return DFS(project, graph, true)
    .map(
      p => constructNode(p, definitionFile.default?.["build-command"], definitionFile.build)
    );
}

export async function getFullDownstreamProjects(definitionFileLocation: string,
  project: string,
  opts?: ReaderOpts) {
    const definitionFile = await readDefinitionFile(definitionFileLocation, opts);
    const graph = constructGraph(definitionFile.dependencies as Dependency[]);
    return DFS(project, graph).map(
      p => constructNode(p, definitionFile.default?.["build-command"], definitionFile.build)
    );
}
