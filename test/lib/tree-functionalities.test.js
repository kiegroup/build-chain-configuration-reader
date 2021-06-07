const {
  getOrderedListForTree,
  getOrderedListForProject
} = require("../../src/lib/tree-functionalities");
jest.mock("../../src/lib/reader");
const {
  readDefinitionFile: readDefinitionFileMock
} = require("../../src/lib/reader");

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

afterEach(() => {
  jest.clearAllMocks();
});
test("getOrderedList", async () => {
  // Arrange
  const expectedResult = [
    "kiegroup/lienzo-core",
    "kiegroup/droolsjbpm-build-bootstrap",
    "kiegroup/lienzo-tests",
    "kiegroup/kie-soup",
    "kiegroup/appformer",
    "kiegroup/drools",
    "kiegroup/jbpm",
    "kiegroup/optaplanner",
    "kiegroup/kie-uberfire-extensions",
    "kiegroup/kie-jpmml-integration",
    "kiegroup/droolsjbpm-integration",
    "kiegroup/openshift-drools-hacep",
    "kiegroup/kie-wb-playground",
    "kiegroup/kie-wb-common",
    "kiegroup/drools-wb",
    "kiegroup/jbpm-designer",
    "kiegroup/jbpm-work-items",
    "kiegroup/jbpm-wb",
    "kiegroup/kie-wb-distributions",
    "kiegroup/optaplanner-wb",
    "kiegroup/optaweb-employee-rostering",
    "kiegroup/optaweb-vehicle-routing",
    "kiegroup/droolsjbpm-tools",
    "kiegroup/droolsjbpm-knowledge",
    "kiegroup/kie-docs"
  ];
  readDefinitionFileMock.mockResolvedValueOnce(
    yaml.safeLoad(
      fs.readFileSync(
        path.join(
          ".",
          "test",
          "resources",
          "build-config-with-dependencies.yaml"
        ),
        "utf8"
      )
    )
  );
  // Act
  const orderedList = await getOrderedListForTree(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
  );

  // Arrange
  expect(expectedResult).toStrictEqual(orderedList.map(e => e.project));
});

test("getOrderedListForProject", async () => {
  // Arrange
  const expectedResult = [
    "kiegroup/lienzo-core",
    "kiegroup/droolsjbpm-build-bootstrap",
    "kiegroup/lienzo-tests",
    "kiegroup/kie-soup",
    "kiegroup/appformer",
    "kiegroup/drools",
    "kiegroup/jbpm",
    "kiegroup/optaplanner",
    "kiegroup/kie-uberfire-extensions",
    "kiegroup/kie-jpmml-integration",
    "kiegroup/droolsjbpm-integration",
    "kiegroup/openshift-drools-hacep",
    "kiegroup/kie-wb-playground",
    "kiegroup/kie-wb-common",
    "kiegroup/drools-wb",
    "kiegroup/jbpm-designer",
    "kiegroup/jbpm-work-items",
    "kiegroup/jbpm-wb",
    "kiegroup/kie-wb-distributions"
  ];
  readDefinitionFileMock.mockResolvedValueOnce(
    yaml.safeLoad(
      fs.readFileSync(
        path.join(
          ".",
          "test",
          "resources",
          "build-config-with-dependencies.yaml"
        ),
        "utf8"
      )
    )
  );
  // Act
  const orderedList = await getOrderedListForProject(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml"),
    "kiegroup/kie-wb-distributions"
  );

  // Arrange
  expect(expectedResult).toStrictEqual(orderedList.map(e => e.project));
});

test("fullDownstreamChain kie-wb-distributions", async () => {
  // Arrange
  readDefinitionFileMock.mockResolvedValueOnce(
    yaml.safeLoad(
      fs.readFileSync(
        path.join(
          ".",
          "test",
          "resources",
          "build-config-with-dependencies.yaml"
        ),
        "utf8"
      )
    )
  );

  const expectedResult = [
    { project: "kiegroup/lienzo-core", mapping: undefined },
    {
      project: "kiegroup/droolsjbpm-build-bootstrap",
      mapping: undefined
    },
    { project: "kiegroup/lienzo-tests", mapping: undefined },
    { project: "kiegroup/kie-soup", mapping: undefined },
    { project: "kiegroup/appformer", mapping: undefined },
    { project: "kiegroup/drools", mapping: undefined },
    {
      project: "kiegroup/jbpm",
      mapping: undefined
    },
    {
      project: "kiegroup/optaplanner",
      mapping: {
        dependencies: {
          default: [
            {
              source: "7.x",
              target: "master"
            }
          ]
        },
        dependant: {
          default: [
            {
              source: "master",
              target: "7.x"
            }
          ]
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

  // Act
  const result = await getOrderedListForProject(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml"),
    "kiegroup/kie-wb-distributions"
  );

  // Assert
  expect(expectedResult).toStrictEqual(
    result.map(e => {
      return { project: e.project, mapping: e.mapping };
    })
  );
});

test("fullDownstreamChain optaweb-employee-rostering", async () => {
  // Arrange
  readDefinitionFileMock.mockResolvedValueOnce(
    yaml.safeLoad(
      fs.readFileSync(
        path.join(
          ".",
          "test",
          "resources",
          "build-config-with-dependencies.yaml"
        ),
        "utf8"
      )
    )
  );

  const expectedResult = [
    { project: "kiegroup/lienzo-core", mapping: undefined },
    {
      project: "kiegroup/droolsjbpm-build-bootstrap",
      mapping: undefined
    },
    { project: "kiegroup/lienzo-tests", mapping: undefined },
    { project: "kiegroup/kie-soup", mapping: undefined },
    { project: "kiegroup/appformer", mapping: undefined },
    {
      project: "kiegroup/drools",
      mapping: undefined
    },
    {
      project: "kiegroup/jbpm",
      mapping: undefined
    },
    {
      project: "kiegroup/optaplanner",
      mapping: {
        dependencies: {
          default: [{ source: "7.x", target: "master" }]
        },
        dependant: {
          default: [
            {
              source: "master",
              target: "7.x"
            }
          ]
        },
        exclude: [
          "kiegroup/optaweb-employee-rostering",
          "kiegroup/optaweb-vehicle-routing"
        ]
      }
    },
    {
      project: "kiegroup/optaweb-employee-rostering",
      mapping: {
        dependencies: {
          default: [
            {
              source: "7.x",
              target: "master"
            }
          ]
        },
        dependant: {
          default: [
            {
              source: "master",
              target: "7.x"
            }
          ]
        },
        exclude: ["kiegroup/optaweb-vehicle-routing", "kiegroup/optaplanner"]
      }
    }
  ];

  // Act
  const result = await getOrderedListForProject(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml"),
    "kiegroup/optaweb-employee-rostering"
  );
  // Assert
  expect(expectedResult).toStrictEqual(
    result.map(e => {
      return { project: e.project, mapping: e.mapping };
    })
  );
});
