const { getTreeForProject } = require("../../../src/lib/project-tree");
const {
  parentChainFromNode,
  childChainFromNode
} = require("../../../src/lib/util/chain-util");
const path = require("path");

test("parentChainFromNode kie-docs", async () => {
  // Arrange
  const expectedResult = ["kiegroup/kie-docs"];
  const definitionTreeNode = await getTreeForProject(
    path.join(".", "test", "resources", "build-config.yaml"),
    "kiegroup/kie-docs"
  );

  // Act
  const result = parentChainFromNode(definitionTreeNode);

  // Assert
  expect(expectedResult).toStrictEqual(result.map(node => node.project));
});

test("parentChainFromNode kie-soup", async () => {
  // Arrange
  const expectedResult = [
    "kiegroup/droolsjbpm-build-bootstrap",
    "kiegroup/kie-soup"
  ];
  const definitionTreeNode = await getTreeForProject(
    path.join(".", "test", "resources", "build-config.yaml"),
    "kiegroup/kie-soup"
  );

  // Act
  const result = parentChainFromNode(definitionTreeNode);

  // Assert
  expect(expectedResult).toStrictEqual(result.map(node => node.project));
});

test("parentChainFromNode drools-wb", async () => {
  // Arrange
  const expectedResult = [
    "kiegroup/lienzo-core",
    "kiegroup/droolsjbpm-build-bootstrap",
    "kiegroup/kie-soup",
    "kiegroup/drools",
    "kiegroup/jbpm",
    "kiegroup/optaplanner",
    "kiegroup/kie-jpmml-integration",
    "kiegroup/droolsjbpm-integration",
    "kiegroup/openshift-drools-hacep",
    "kiegroup/kie-wb-playground",
    "kiegroup/kie-wb-common",
    "kiegroup/drools-wb"
  ];
  const definitionTreeNode = await getTreeForProject(
    path.join(".", "test", "resources", "build-config.yaml"),
    "kiegroup/drools-wb"
  );

  // Act
  const result = parentChainFromNode(definitionTreeNode);

  // Assert
  expect(expectedResult).toStrictEqual(result.map(node => node.project));
});

test("parentChainFromNode optaplanner", async () => {
  // Arrange
  const expectedResult = [
    { project: "kiegroup/droolsjbpm-build-bootstrap", mapping: undefined },
    { project: "kiegroup/kie-soup", mapping: undefined },
    {
      project: "kiegroup/drools",
      mapping: undefined
    },
    { project: "kiegroup/jbpm", mapping: undefined },
    {
      project: "kiegroup/optaplanner",
      mapping: {
        dependencies: {
          default: {
            source: "7.x",
            target: "master"
          }
        },
        dependant: {
          default: {
            source: "master",
            target: "7.x"
          }
        },
        exclude: [
          "kiegroup/optaweb-employee-rostering",
          "kiegroup/optaweb-vehicle-routing"
        ]
      }
    }
  ];
  const definitionTreeNode = await getTreeForProject(
    path.join(".", "test", "resources", "build-config.yaml"),
    "kiegroup/optaplanner"
  );

  // Act
  const result = parentChainFromNode(definitionTreeNode);
  // Assert
  expect(expectedResult).toStrictEqual(
    result.map(node => {
      return { project: node.project, mapping: node.mapping };
    })
  );
});

test("parentChainFromNode kie-wb-distributions", async () => {
  // Arrange
  const expectedResult = [
    { project: "kiegroup/lienzo-core", mapping: undefined },
    { project: "kiegroup/droolsjbpm-build-bootstrap", mapping: undefined },
    { project: "kiegroup/lienzo-tests", mapping: undefined },
    { project: "kiegroup/kie-soup", mapping: undefined },
    { project: "kiegroup/appformer", mapping: undefined },
    { project: "kiegroup/drools", mapping: undefined },
    { project: "kiegroup/jbpm", mapping: undefined },
    {
      project: "kiegroup/optaplanner",
      mapping: {
        dependencies: {
          default: {
            source: "7.x",
            target: "master"
          }
        },
        dependant: {
          default: {
            source: "master",
            target: "7.x"
          }
        },
        exclude: [
          "kiegroup/optaweb-employee-rostering",
          "kiegroup/optaweb-vehicle-routing"
        ]
      }
    },
    { project: "kiegroup/kie-uberfire-extensions", mapping: undefined },
    { project: "kiegroup/kie-jpmml-integration", mapping: undefined },
    { project: "kiegroup/droolsjbpm-integration", mapping: undefined },
    { project: "kiegroup/openshift-drools-hacep", mapping: undefined },
    { project: "kiegroup/kie-wb-playground", mapping: undefined },
    { project: "kiegroup/kie-wb-common", mapping: undefined },
    { project: "kiegroup/drools-wb", mapping: undefined },
    { project: "kiegroup/jbpm-designer", mapping: undefined },
    { project: "kiegroup/jbpm-work-items", mapping: undefined },
    { project: "kiegroup/jbpm-wb", mapping: undefined },
    { project: "kiegroup/kie-wb-distributions", mapping: undefined }
  ];
  const definitionTreeNode = await getTreeForProject(
    path.join(".", "test", "resources", "build-config.yaml"),
    "kiegroup/kie-wb-distributions"
  );

  // Act
  const result = parentChainFromNode(definitionTreeNode);
  // Assert
  expect(expectedResult).toStrictEqual(
    result.map(node => {
      return { project: node.project, mapping: node.mapping };
    })
  );
});

test("childChainFromNode drools-wb", async () => {
  // Arrange
  const expectedResult = [
    "kiegroup/drools-wb",
    "kiegroup/optaplanner-wb",
    "kiegroup/jbpm-wb",
    "kiegroup/kie-wb-distributions"
  ];
  const definitionTreeNode = await getTreeForProject(
    path.join(".", "test", "resources", "build-config.yaml"),
    "kiegroup/drools-wb"
  );

  // Act
  const result = childChainFromNode(definitionTreeNode);

  // Assert
  expect(expectedResult).toStrictEqual(result.map(node => node.project));
});

test("childChainFromNode droolsjbpm-build-bootstrap", async () => {
  // Arrange
  const expectedResult = [
    "kiegroup/droolsjbpm-build-bootstrap",
    "kiegroup/kie-soup",
    "kiegroup/droolsjbpm-knowledge",
    "kiegroup/drools",
    "kiegroup/jbpm",
    "kiegroup/optaplanner",
    "kiegroup/optaweb-employee-rostering",
    "kiegroup/optaweb-vehicle-routing",
    "kiegroup/kie-jpmml-integration",
    "kiegroup/droolsjbpm-integration",
    "kiegroup/openshift-drools-hacep",
    "kiegroup/kie-wb-playground",
    "kiegroup/jbpm-work-items",
    "kiegroup/kie-wb-common",
    "kiegroup/drools-wb",
    "kiegroup/jbpm-designer",
    "kiegroup/droolsjbpm-tools",
    "kiegroup/appformer",
    "kiegroup/kie-uberfire-extensions",
    "kiegroup/jbpm-wb",
    "kiegroup/optaplanner-wb",
    "kiegroup/kie-wb-distributions"
  ];
  const definitionTreeNode = await getTreeForProject(
    path.join(".", "test", "resources", "build-config.yaml"),
    "kiegroup/droolsjbpm-build-bootstrap"
  );

  // Act
  const result = childChainFromNode(definitionTreeNode);

  // Assert
  expect(expectedResult).toStrictEqual(result.map(node => node.project));
});

test("childChainFromNode droolsjbpm-build-bootstrap", async () => {
  // Arrange
  const expectedResult = [
    "kiegroup/lienzo-core",
    "kiegroup/lienzo-tests",
    "kiegroup/appformer",
    "kiegroup/kie-uberfire-extensions",
    "kiegroup/kie-wb-common",
    "kiegroup/jbpm-designer",
    "kiegroup/drools-wb",
    "kiegroup/optaplanner-wb",
    "kiegroup/jbpm-wb",
    "kiegroup/kie-wb-distributions"
  ];
  const definitionTreeNode = await getTreeForProject(
    path.join(".", "test", "resources", "build-config.yaml"),
    "kiegroup/lienzo-core"
  );

  // Act
  const result = childChainFromNode(definitionTreeNode);

  // Assert
  expect(expectedResult).toStrictEqual(result.map(node => node.project));
});
