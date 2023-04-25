import { Dependency } from "@bc-cr/domain/dependencies";
import { readDefinitionFile } from "@bc-cr/reader";
import { constructNode } from "@bc-cr/util/construct-node";
import path from "path";

const resource = path.resolve(__dirname, "..", "resources", "construct-tree");


test("get build command with default", async () => {
  const definitionFile = await readDefinitionFile(
    path.join(resource, "build-with-default.yml")
  );

  const nodes = (definitionFile.dependencies as Dependency[]).map(
    d => constructNode(d, definitionFile.default?.["build-command"], definitionFile.build)
  );

  expect(nodes).toMatchObject([
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

  const nodes = (definitionFile.dependencies as Dependency[]).map(
    d => constructNode(d, definitionFile.default?.["build-command"], definitionFile.build)
  );

  expect(nodes).toMatchObject([
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

test("skip project", async () => {
  const definitionFile = await readDefinitionFile(
    path.join(resource, "skip-project.yml")
  );

  const nodes = (definitionFile.dependencies as Dependency[]).map(
    d => constructNode(d, definitionFile.default?.["build-command"], definitionFile.build)
  );

  expect(nodes).toMatchObject([
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
      commands: {
        upstream: [],
        current: [],
        downstream: [],
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
