import { Node } from "@bc-cr/domain/node";
import {
  getOrderedListForProject,
  getTree,
  getTreeForProject,
  parentChainFromNode,
} from "@bc-cr/tree";
import path from "path";
const resources = path.join(__dirname, "resources", "tree", "tree.yml");

test("get tree", async () => {
  const tree = await getTree(resources);
  // don't have to test for tree structure since that is already done in construct tree tests
  matchProject(tree, [
    "kiegroup/lienzo-core",
    "kiegroup/droolsjbpm-build-bootstrap",
    "kiegroup/kie-docs",
  ]);
});

test.each([
  ["root", "kiegroup/kie-docs"],
  ["non-root", "kiegroup/jbpm"],
  ["not found", "kiegroup/unknownproject"],
])("get tree for project - %p", async (_title: string, project: string) => {
  const node = await getTreeForProject(resources, project);
  matchProject(node ? [node] : node, [project]);
});

test.each([
  [
    "no parents",
    "kiegroup/droolsjbpm-build-bootstrap",
    ["kiegroup/droolsjbpm-build-bootstrap"],
  ],
  [
    "parents",
    "kiegroup/appformer",
    [
      "kiegroup/lienzo-core",
      "kiegroup/lienzo-tests",
      "kiegroup/droolsjbpm-build-bootstrap",
      "kiegroup/kie-soup",
      "kiegroup/appformer",
    ],
  ],
])(
  "get parent chain for node - %p",
  async (_title: string, project: string, expected: string[]) => {
    const node = await getTreeForProject(resources, project);
    expect(node).not.toBe(undefined);
    const parents = parentChainFromNode(node!);
    matchProject(parents, expected);
  }
);

test.each([
  [
    "only upstream",
    "kiegroup/kie-wb-distributions",
    [
      "kiegroup/lienzo-core",
      "kiegroup/lienzo-tests",
      "kiegroup/droolsjbpm-build-bootstrap",
      "kiegroup/kie-soup",
      "kiegroup/appformer",
      "kiegroup/kie-uberfire-extensions",
      "kiegroup/droolsjbpm-knowledge",
      "kiegroup/drools",
      "kiegroup/jbpm",
      "kiegroup/kie-jpmml-integration",
      "kiegroup/optaplanner",
      "kiegroup/droolsjbpm-integration",
      "kiegroup/kie-wb-playground",
      "kiegroup/kie-wb-common",
      "kiegroup/drools-wb",
      "kiegroup/optaplanner-wb",
      "kiegroup/jbpm-designer",
      "kiegroup/jbpm-work-items",
      "kiegroup/jbpm-wb",
      "kiegroup/kie-wb-distributions",
    ],
  ],
  [
    "only downstream",
    "kiegroup/droolsjbpm-build-bootstrap",
    [
      "kiegroup/droolsjbpm-build-bootstrap",
      "kiegroup/kie-soup",
      "kiegroup/appformer",
      "kiegroup/kie-uberfire-extensions",
      "kiegroup/kie-wb-common",
      "kiegroup/drools-wb",
      "kiegroup/optaplanner-wb",
      "kiegroup/kie-wb-distributions",
      "kiegroup/jbpm-wb",
      "kiegroup/jbpm-designer",
      "kiegroup/droolsjbpm-knowledge",
      "kiegroup/drools",
      "kiegroup/jbpm",
      "kiegroup/kie-jpmml-integration",
      "kiegroup/droolsjbpm-integration",
      "kiegroup/openshift-drools-hacep",
      "kiegroup/kie-wb-playground",
      "kiegroup/jbpm-work-items",
      "kiegroup/optaplanner",
      "kiegroup/optaweb-employee-rostering",
      "kiegroup/optaweb-vehicle-routing",
    ],
  ],
  [
    "upstream + downstream",
    "kiegroup/jbpm",
    [
      "kiegroup/droolsjbpm-build-bootstrap",
      "kiegroup/kie-soup",
      "kiegroup/droolsjbpm-knowledge",
      "kiegroup/drools",
      "kiegroup/jbpm",
      "kiegroup/kie-jpmml-integration",
      "kiegroup/droolsjbpm-integration",
      "kiegroup/openshift-drools-hacep",
      "kiegroup/kie-wb-playground",
      "kiegroup/kie-wb-common",
      "kiegroup/drools-wb",
      "kiegroup/optaplanner-wb",
      "kiegroup/kie-wb-distributions",
      "kiegroup/jbpm-wb",
      "kiegroup/jbpm-designer",
      "kiegroup/jbpm-work-items",
    ],
  ],
])(
  "get ordered list for project - %p",
  async (_title: string, project: string, expected: string[]) => {
    const node = await getTreeForProject(resources, project);
    expect(node).not.toBe(undefined);
    const list = getOrderedListForProject(node!);
    matchProject(list, expected);
  }
);

function matchProject(
  result: Node[] | undefined,
  expected: string[] | undefined
) {
  if (result) {
    expect(result.map(node => node.project)).toStrictEqual(expected);
  } else {
    expect(result).toBe(undefined);
  }
}
