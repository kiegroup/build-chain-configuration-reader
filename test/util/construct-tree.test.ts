import { Dependency } from "@bc-cr/domain/dependencies";
import { readDefinitionFile } from "@bc-cr/reader";
import { constructTree } from "@bc-cr/util/construct-tree";
import path from "path";

const resource = path.resolve(__dirname, "..", "resources", "construct-tree");

test("missing project", async () => {
  const definitionFile = await readDefinitionFile(
    path.join(resource, "missing-project.yml")
  );

  expect(() =>
    constructTree(
      definitionFile.dependencies as Dependency[],
      definitionFile.default?.["build-command"],
      definitionFile.build
    )
  ).toThrowError(
    "The project kiegroup/lienzo does not exist on project list. Please review your project definition file"
  );
});

test("tree structure", async () => {
  const definitionFile = await readDefinitionFile(
    path.join(resource, "tree.yml")
  );

  const tree = constructTree(
    definitionFile.dependencies as Dependency[],
    definitionFile.default?.["build-command"],
    definitionFile.build
  );

  const optaplanner = {
    project: "kiegroup/optaplanner",
    parents: [{ project: "kiegroup/jbpm" }],
    children: [],
    clone: ["opta1", "opta2"]
  };

  const jbpm = {
    project: "kiegroup/jbpm",
    parents: [{ project: "kiegroup/drools" }],
    children: [optaplanner],
  };

  const drools = {
    project: "kiegroup/drools",
    parents: [
      { project: "kiegroup/appformer" },
    ],
    children: [jbpm],
  };

  const appformer = {
    project: "kiegroup/appformer",
    parents: [
      { project: "kiegroup/lienzo-tests" },
      { project: "kiegroup/kie-soup" },
    ],
    children: [drools],
  };

  expect(tree).toMatchObject([
    {
      project: "kiegroup/lienzo-core",
      parents: [],
      children: [
        {
          project: "kiegroup/lienzo-tests",
          parents: [{ project: "kiegroup/lienzo-core" }],
          children: [appformer],
        },
        {
          project: "kiegroup/droolsjbpm-build-bootstrap",
          parents: [{ project: "kiegroup/lienzo-core" }],
          children: [
            {
              project: "kiegroup/kie-soup",
              parents: [{ project: "kiegroup/droolsjbpm-build-bootstrap" }],
              children: [appformer],
            },
          ],
        },
      ],
    },
    { project: "kiegroup/kie-docs", parents: [], children: [], clone: ["docs"] },
  ]);
});
