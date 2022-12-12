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

test("get build command with default", async () => {
  const definitionFile = await readDefinitionFile(
    path.join(resource, "build-with-default.yml")
  );

  const tree = constructTree(
    definitionFile.dependencies as Dependency[],
    definitionFile.default?.["build-command"],
    definitionFile.build
  );

  expect(tree).toMatchObject([
    {
      project: "kiegroup/lienzo-core",
      after: {
        upstream: ["cmd 4"],
        current: [],
        downstream: [],
      },
      commands: {
        upstream: ["cmd 6"],
        current: ["cmd 1", "cmd 2"],
        downstream: [],
      },
      before: {
        downstream: ["cmd 9"],
        current: ["cmd 12"],
        upstream: [],
      },
    },
    {
      project: "kiegroup/droolsjbpm-build-bootstrap",
      after: {
        upstream: ["cmd 10"],
        current: ["cmd 11"],
        downstream: [],
      },
      commands: {
        upstream: ["cmd 8"],
        current: ["cmd 7"],
        downstream: [],
      },
      before: {
        downstream: ["cmd 5"],
        current: ["cmd 12"],
        upstream: [],
      },
    },
    {
      project: "kiegroup/drools",
      after: {
        upstream: ["cmd 4"],
        current: [],
        downstream: [],
      },
      commands: {
        upstream: ["cmd 3"],
        current: ["cmd 1", "cmd 2"],
        downstream: [],
      },
      before: {
        downstream: ["cmd 5"],
        current: ["cmd 12"],
        upstream: [],
      },
    },
  ]);
});

test("get build command without default", async () => {
  const definitionFile = await readDefinitionFile(
    path.join(resource, "build-without-default.yml")
  );

  const tree = constructTree(
    definitionFile.dependencies as Dependency[],
    definitionFile.default?.["build-command"],
    definitionFile.build
  );

  expect(tree).toMatchObject([
    { project: "kiegroup/lienzo-core" },
    {
      project: "kiegroup/droolsjbpm-build-bootstrap",
      after: {
        upstream: ["cmd 10"],
        current: ["cmd 11"],
        downstream: [],
      },
      commands: {
        upstream: ["cmd 8"],
        current: ["cmd 7"],
        downstream: [],
      },
    },
    { project: "kiegroup/drools" },
  ]);
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
    parents: [{ project: "kiegroup/drools" }, { project: "kiegroup/jbpm" }],
    children: [],
    clone: ["opta1", "opta2"]
  };

  const jbpm = {
    project: "kiegroup/jbpm",
    parents: [{ project: "kiegroup/drools" }, { project: "kiegroup/kie-soup" }],
    children: [optaplanner],
  };

  const drools = {
    project: "kiegroup/drools",
    parents: [
      { project: "kiegroup/appformer" },
      { project: "kiegroup/kie-soup" },
    ],
    children: [jbpm, optaplanner],
  };

  const appformer = {
    project: "kiegroup/appformer",
    parents: [
      { project: "kiegroup/droolsjbpm-build-bootstrap" },
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
              children: [appformer, drools, jbpm],
            },
            appformer,
          ],
        },
      ],
    },
    { project: "kiegroup/kie-docs", parents: [], children: [], clone: ["docs"] },
  ]);
});
