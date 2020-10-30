const {
  getTree,
  getTreeForProject,
  getOrderedListForTree,
  getOrderedListForProject,
  readDefinitionFile,
  parentChainFromNode,
  treatUrl
} = require("../index");
jest.mock("../index");
getTree.mockImplementation(() => "getTree");
getTreeForProject.mockImplementation(() => "getTreeForProject");
getOrderedListForTree.mockImplementation(() => "getOrderedListForTree");
getOrderedListForProject.mockImplementation(() => "getOrderedListForProject");
readDefinitionFile.mockImplementation(() => "readDefinitionFile");
parentChainFromNode.mockImplementation(() => "parentChainFromNode");
treatUrl.mockImplementation(() => "treatUrl");

const path = require("path");

test("getTree", async () => {
  // Act
  const result = await getTree(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
  );
  // Assert
  expect(result).toBe("getTree");
});

test("getTreeForProject", async () => {
  // Act
  const result = await getTreeForProject(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
  );
  // Assert
  expect(result).toBe("getTreeForProject");
});

test("getOrderedListForTree", async () => {
  // Act
  const result = await getOrderedListForTree(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
  );
  // Assert
  expect(result).toBe("getOrderedListForTree");
});

test("getOrderedListForProject", async () => {
  // Act
  const result = await getOrderedListForProject(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
  );
  // Assert
  expect(result).toBe("getOrderedListForProject");
});

test("readDefinitionFile", async () => {
  // Act
  const result = await readDefinitionFile(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
  );
  // Assert
  expect(result).toBe("readDefinitionFile");
});

test("parentChainFromNode", async () => {
  // Act
  const result = await parentChainFromNode(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
  );
  // Assert
  expect(result).toBe("parentChainFromNode");
});

test("treatUrl", async () => {
  // Act
  const result = treatUrl("url", {});
  // Assert
  expect(result).toBe("treatUrl");
});
