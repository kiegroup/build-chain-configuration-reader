const {
  getTree,
  getTreeForProject,
  dependencyListToTree
} = require("../../src/lib/project-tree");
jest.mock("../../src/lib/reader");
const {
  readDefinitionFile: readDefinitionFileMock
} = require("../../src/lib/reader");

const { jsonStringFunction } = require("../../src/lib/util/chain-util");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

afterEach(() => {
  jest.clearAllMocks();
});

test("generate example file", async () => {
  // Arrange
  readDefinitionFileMock.mockResolvedValueOnce(
    yaml.safeLoad(
      fs.readFileSync(
        path.join(
          ".",
          "test",
          "resources",
          "build-config-with-dependencies-for-example.yaml"
        ),
        "utf8"
      )
    )
  );
  // Act
  const definitionTree = await getTree(
    path.join(
      ".",
      "test",
      "resources",
      "build-config-with-dependencies-for-example.yaml"
    )
  );

  const cache = [];
  fs.writeFileSync(
    path.join(".", "docs", "tree-example.json"),
    JSON.stringify(
      definitionTree,
      (key, value) => jsonStringFunction(key, value, cache),
      2
    )
  );
});

test("get tree from file", async () => {
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
  // Act
  const definitionTree = await getTree(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
  );

  // Assert
  expect(definitionTree.length).toEqual(2);
  expect(definitionTree[0].project).toEqual("kiegroup/lienzo-core");
  checkGroupName(definitionTree[0], "kiegroup", "lienzo-core");
  checkChildren(definitionTree[0], [
    "kiegroup/lienzo-tests",
    "kiegroup/droolsjbpm-build-bootstrap"
  ]);
  checkParents(definitionTree[0], []);

  checkChildren(definitionTree[0].children[0], ["kiegroup/appformer"]);
  checkGroupName(definitionTree[0].children[0], "kiegroup", "lienzo-tests");
  checkGroupName(
    definitionTree[0].children[1],
    "kiegroup",
    "droolsjbpm-build-bootstrap"
  );
  checkParents(definitionTree[0].children[0], ["kiegroup/lienzo-core"]);

  checkChildren(definitionTree[0].children[1], [
    "kiegroup/kie-soup",
    "kiegroup/appformer"
  ]);
  checkParents(definitionTree[0].children[1], ["kiegroup/lienzo-core"]);

  checkChildren(definitionTree[1], []);
  checkParents(definitionTree[1], []);
});

test("get tree for project", async () => {
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
  // Act
  const projectTree = await getTreeForProject(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml"),
    "kiegroup/jbpm-wb"
  );

  // Assert
  expect(readDefinitionFileMock).toHaveBeenCalledTimes(1);
  expect(readDefinitionFileMock).toHaveBeenCalledWith(
    "test/resources/build-config-with-dependencies.yaml",
    {}
  );

  expect(projectTree.project).toEqual("kiegroup/jbpm-wb");
  checkChildren(projectTree, ["kiegroup/kie-wb-distributions"]);
  checkParents(projectTree, [
    "kiegroup/kie-uberfire-extensions",
    "kiegroup/drools-wb",
    "kiegroup/jbpm-designer",
    "kiegroup/jbpm-work-items"
  ]);
});

test("get tree for project placeholders", async () => {
  // Arrange
  const placeholders = { key: "value" };

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
  await getTreeForProject(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml"),
    "kiegroup/jbpm-wb",
    placeholders
  );

  // Assert
  expect(readDefinitionFileMock).toHaveBeenCalledTimes(1);
  expect(readDefinitionFileMock).toHaveBeenCalledWith(
    "test/resources/build-config-with-dependencies.yaml",
    placeholders
  );
});

test("get tree from URL", async () => {
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
  // Act
  const definitionTree = await getTree("http://whateverurl.rh/definition.yaml");

  // Assert
  expect(readDefinitionFileMock).toHaveBeenCalledTimes(1);
  expect(readDefinitionFileMock).toHaveBeenCalledWith(
    "http://whateverurl.rh/definition.yaml",
    {}
  );
  expect(definitionTree.length).toEqual(2);
  expect(definitionTree[0].project).toEqual("kiegroup/lienzo-core");
  checkChildren(definitionTree[0], [
    "kiegroup/lienzo-tests",
    "kiegroup/droolsjbpm-build-bootstrap"
  ]);
  checkParents(definitionTree[0], []);

  checkChildren(definitionTree[0].children[0], ["kiegroup/appformer"]);
  checkParents(definitionTree[0].children[0], ["kiegroup/lienzo-core"]);

  checkChildren(definitionTree[0].children[1], [
    "kiegroup/kie-soup",
    "kiegroup/appformer"
  ]);
  checkParents(definitionTree[0].children[1], ["kiegroup/lienzo-core"]);

  expect(definitionTree[1].project).toEqual("kiegroup/kie-docs");
  checkChildren(definitionTree[1], []);
  checkParents(definitionTree[1], []);
});

test("get tree with placeholders", async () => {
  // Arrange
  const placeholders = { key: "value" };
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
  await getTree("http://whateverurl.rh/definition.yaml", placeholders);

  // Assert
  expect(readDefinitionFileMock).toHaveBeenCalledTimes(1);
  expect(readDefinitionFileMock).toHaveBeenCalledWith(
    "http://whateverurl.rh/definition.yaml",
    placeholders
  );
});

test("dependencyListToTree", async () => {
  // Arrange
  const buildConfiguration = {
    default: {
      "build-command": {
        current: "mvn current",
        upstream: "mvn upstream",
        before: {
          current: "mvn before current",
          upstream: "mvn before upstream"
        },
        after: {
          current: "mvn after current",
          upstream: "mvn after upstream"
        }
      }
    },
    build: [
      {
        project: "group/12",
        "build-command": {
          upstream: "mvn upstream 12"
        },
        "archive-artifacts": {
          path: "**/dashbuilder-runtime.war"
        }
      }
    ]
  };

  const expected12Build = {
    "build-command": {
      current: "mvn current",
      upstream: "mvn upstream 12",
      before: {
        current: "mvn before current",
        upstream: "mvn before upstream"
      },
      after: {
        current: "mvn after current",
        upstream: "mvn after upstream"
      }
    },
    "archive-artifacts": {
      path: "**/dashbuilder-runtime.war",
      dependencies: "none",
      "if-no-files-found": "warn",
      name: "12",
      paths: [
        {
          on: "success",
          path: "**/dashbuilder-runtime.war"
        }
      ]
    }
  };

  const group6Mapping = {
    dependencies: {
      default: {
        source: "7.x",
        target: "master"
      },
      "group/7": {
        source: "7.x",
        target: "8.x"
      }
    },
    source: "master",
    target: "7.x",
    exclude: ["group/12"]
  };

  const dependencyList = [
    {
      project: "group/12"
    },
    {
      project: "group/6",
      dependencies: [{ project: "group/12" }],
      mapping: group6Mapping
    },
    {
      project: "group/7",
      dependencies: [{ project: "group/12" }]
    },
    {
      project: "group/9"
    },
    {
      project: "group/11",
      dependencies: [{ project: "group/9" }]
    },
    {
      project: "group/13",
      dependencies: [{ project: "group/11" }]
    },
    {
      project: "group/14",
      dependencies: [{ project: "group/11" }, { project: "group/12" }]
    },
    {
      project: "group/15",
      dependencies: [{ project: "group/14" }]
    }
  ];
  // Act
  const definitionTree = dependencyListToTree(
    dependencyList,
    buildConfiguration
  );
  // Assert
  expect(definitionTree.length).toEqual(2);

  // 12
  expect(definitionTree[0].project).toEqual("group/12");
  expect(definitionTree[0].build).toEqual(expected12Build);
  checkChildren(
    definitionTree[0],
    ["group/6", "group/7", "group/14"],
    buildConfiguration.default
  );
  checkParents(definitionTree[0], []);

  // 12 - 6
  checkChildren(definitionTree[0].children[0], []);
  checkParents(definitionTree[0].children[0], ["group/12"], expected12Build);
  expect(definitionTree[0].children[0].project).toBe("group/6");
  expect(definitionTree[0].children[0].mapping).toBe(group6Mapping);
  // 12 - 7
  checkChildren(definitionTree[0].children[1], []);
  checkParents(definitionTree[0].children[1], ["group/12"], expected12Build);
  // 12 - 14
  checkChildren(
    definitionTree[0].children[2],
    ["group/15"],
    buildConfiguration.default
  );
  checkParents(
    definitionTree[0].children[2],
    ["group/11", "group/12"],
    [buildConfiguration.default, expected12Build]
  );

  // 9
  expect(definitionTree[1].project).toEqual("group/9");
  expect(definitionTree[1].build).toEqual(buildConfiguration.default);
  checkChildren(definitionTree[1], ["group/11"], buildConfiguration.default);
  checkParents(definitionTree[1], []);

  // 9 - 11
  checkChildren(
    definitionTree[1].children[0],
    ["group/13", "group/14"],
    buildConfiguration.default
  );
  checkParents(
    definitionTree[1].children[0],
    ["group/9"],
    buildConfiguration.default
  );

  // 9 - 11 - 13
  checkChildren(definitionTree[1].children[0].children[0], []);
  checkParents(
    definitionTree[1].children[0].children[0],
    ["group/11"],
    buildConfiguration.default
  );
  // 9 - 11 - 14
  checkChildren(
    definitionTree[1].children[0].children[1],
    ["group/15"],
    buildConfiguration.default
  );
  checkParents(
    definitionTree[1].children[0].children[1],
    ["group/11", "group/12"],
    [buildConfiguration.default, expected12Build]
  );

  // 9 - 11 - 14 - 15
  checkChildren(definitionTree[1].children[0].children[1].children[0], []);
  checkParents(
    definitionTree[1].children[0].children[1].children[0],
    ["group/14"],
    buildConfiguration.default
  );
});

function checkParents(node, expectedParents, expectedBuilds = undefined) {
  expect(
    node.parents.length,
    `Node ${node.project} does not have expected number of parents ${expectedParents.length}. Instead ${node.parents.length}`
  ).toEqual(expectedParents.length);
  expectedParents.forEach((expectedParent, index) => {
    expect(
      node.parents[index].project,
      `Node ${node.project} does not have expected parent ${expectedParent}. Instead ${node.parents[index].project}`
    ).toEqual(expectedParent);
    if (expectedBuilds) {
      const expectedBuild = Array.isArray(expectedBuilds)
        ? expectedBuilds[index]
        : expectedBuilds;
      expect(
        node.parents[index].build,
        `From Node ${node.project}. Project ${
          node.parents[index].project
        } does not have expected build ${JSON.stringify(
          expectedBuild,
          null,
          2
        )}. Instead ${node.parents[index].build}`
      ).toEqual(expectedBuild);
    }
  });
}

function checkChildren(node, expectedChildren, expectedBuilds = undefined) {
  expect(
    node.children.length,
    `Node ${node.project} does not have expected number of children ${expectedChildren.length}. Instead ${node.children.length}`
  ).toEqual(expectedChildren.length);
  expectedChildren.forEach((expectedChild, index) => {
    expect(
      node.children[index].project,
      `Node ${node.project} does not have expected child ${expectedChild}. Instead ${node.children[index].project}`
    ).toEqual(expectedChild);
    if (expectedBuilds) {
      const expectedBuild = Array.isArray(expectedBuilds)
        ? expectedBuilds[index]
        : expectedBuilds;
      expect(
        node.children[index].build,
        `From Node ${node.project}. Project ${
          node.children[index].project
        } does not have expected build ${JSON.stringify(
          expectedBuild,
          null,
          2
        )}. Instead ${node.children[index].build}`
      ).toEqual(expectedBuild);
    }
  });
}

function checkGroupName(node, expectedGroup, expectName) {
  expect(node.repo.group).toBe(expectedGroup);
  expect(node.repo.name).toBe(expectName);
}
