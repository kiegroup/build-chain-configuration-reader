import { Dependency } from "@bc-cr/domain/dependencies";
import { readDefinitionFile } from "@bc-cr/reader";
import { constructGraph } from "@bc-cr/util/construct-graph";
import path from "path";

const resource = path.resolve(__dirname, "..", "resources", "construct-tree");

test("missing project", async () => {
  const definitionFile = await readDefinitionFile(
    path.join(resource, "missing-project.yml")
  );

  expect(() =>
    constructGraph(
      definitionFile.dependencies as Dependency[],
    )
  ).toThrowError(
    "The project kiegroup/lienzo does not exist on project list. Please review your project definition file"
  );
});

test("graph structure", async () => {
  const definitionFile = await readDefinitionFile(
    path.join(resource, "tree.yml")
  );

  const graph = constructGraph(
    definitionFile.dependencies as Dependency[],
  );

  expect(graph).toMatchObject({
    "kiegroup/lienzo-core": {
      incoming: new Set(["kiegroup/lienzo-tests", "kiegroup/droolsjbpm-build-bootstrap"]),
      outgoing: new Set([]),
      depth: -1
    },
    "kiegroup/lienzo-tests": {
      incoming: new Set(["kiegroup/appformer"]),
      outgoing: new Set(["kiegroup/lienzo-core"]),
      depth: -1
    },
    "kiegroup/kie-docs": {
      incoming: new Set(),
      outgoing: new Set(),
      depth: -1
    }
  });
});
