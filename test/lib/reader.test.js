const { readDefinitionFile } = require("../../src/lib/reader");
jest.mock("../../src/lib/util/http");
const { getUrlContent: getUrlContentMock } = require("../../src/lib/util/http");
const path = require("path");
const fs = require("fs");

afterEach(() => {
  jest.clearAllMocks();
});

test("readDefinitionFile with dependencies", async () => {
  // Act
  const result = await readDefinitionFile(
    path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
  );
  // Assert
  expect(result.dependencies.length).toEqual(25);
});

test("readDefinitionFile with external dependencies", async () => {
  // Act
  const result = await readDefinitionFile(
    path.join(".", "test", "resources", "build-config.yaml")
  );
  // Assert
  expect(result.dependencies.length).toEqual(25);
});

test("readDefinitionFile with external dependencies as URL", async () => {
  // Arrange
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(
      path.join(".", "test", "resources", "project-dependencies.yaml")
    )
  );
  // Act
  const result = await readDefinitionFile(
    path.join(".", "test", "resources", "build-config-dependencies-url.yaml")
  );
  // Assert
  expect(result.dependencies.length).toEqual(25);
});

test("readDefinitionFileFromUrl relative embedded dependencies", async () => {
  // Arrange
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(
      path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
    )
  );

  // Act
  const result = await readDefinitionFile(
    "https://raw.githubusercontent.com/kiegroup/build-chain-configuration-reader/main/test/resources/build-config.yaml"
  );

  // Assert
  expect(getUrlContentMock).toHaveBeenCalledTimes(1);
  expect(getUrlContentMock).toHaveBeenCalledWith(
    "https://raw.githubusercontent.com/kiegroup/build-chain-configuration-reader/main/test/resources/build-config.yaml",
    undefined
  );

  expect(Array.isArray(result.dependencies)).toBe(true);
  expect(result.dependencies.length).toEqual(25);
});

test("readDefinitionFileFromUrl relative path dependencies", async () => {
  // Arrange
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(path.join(".", "test", "resources", "build-config.yaml"))
  );
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(
      path.join(".", "test", "resources", "project-dependencies.yaml")
    )
  );

  // Act
  const result = await readDefinitionFile(
    "https://raw.githubusercontent.com/kiegroup/build-chain-configuration-reader/main/test/resources/build-config.yaml"
  );

  // Assert
  expect(getUrlContentMock).toHaveBeenCalledWith(
    "https://raw.githubusercontent.com/kiegroup/build-chain-configuration-reader/main/test/resources/build-config.yaml",
    undefined
  );
  expect(getUrlContentMock).toHaveBeenCalledWith(
    "https://raw.githubusercontent.com/kiegroup/build-chain-configuration-reader/main/test/resources/./project-dependencies.yaml",
    undefined
  );

  expect(Array.isArray(result.dependencies)).toBe(true);
  expect(result.dependencies.length).toEqual(25);
});

test("readDefinitionFileFromUrl url dependencies", async () => {
  // Arrange
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(
      path.join(".", "test", "resources", "build-config-dependencies-url.yaml")
    )
  );
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(
      path.join(".", "test", "resources", "project-dependencies.yaml")
    )
  );

  // Act
  const result = await readDefinitionFile(
    "https://raw.githubusercontent.com/kiegroup/build-chain-configuration-reader/main/test/resources/build-config.yaml"
  );

  // Assert
  expect(getUrlContentMock).toHaveBeenCalledWith(
    "https://raw.githubusercontent.com/kiegroup/build-chain-configuration-reader/main/test/resources/build-config.yaml",
    undefined
  );
  expect(getUrlContentMock).toHaveBeenCalledWith(
    "http://whateverurl.rh/dependencies.yaml",
    undefined
  );

  expect(Array.isArray(result.dependencies)).toBe(true);
  expect(result.dependencies.length).toEqual(25);
});

test("readDefinitionFileFromUrl with place holders relative path dependencies", async () => {
  // Arrange
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(path.join(".", "test", "resources", "build-config.yaml"))
  );
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(
      path.join(".", "test", "resources", "project-dependencies.yaml")
    )
  );

  // Act
  const result = await readDefinitionFile(
    "https://raw.githubusercontent.com/${GROUP}/${PROJECT_NAME}/${BRANCH}/test/resources/build-config.yaml",
    {
      urlPlaceHolders: {
        GROUP: "groupx",
        PROJECT_NAME: "projectx",
        BRANCH: "branchx"
      }
    }
  );

  // Assert
  expect(getUrlContentMock).toHaveBeenCalledWith(
    "https://raw.githubusercontent.com/groupx/projectx/branchx/test/resources/build-config.yaml",
    undefined
  );
  expect(getUrlContentMock).toHaveBeenCalledWith(
    "https://raw.githubusercontent.com/groupx/projectx/branchx/test/resources/./project-dependencies.yaml",
    undefined
  );

  expect(Array.isArray(result.dependencies)).toBe(true);
  expect(result.dependencies.length).toEqual(25);
});

test("readDefinitionFileFromUrl url dependencies placeholders", async () => {
  // Arrange
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(
      path.join(
        ".",
        "test",
        "resources",
        "build-config-dependencies-url-placeholders.yaml"
      )
    )
  );
  getUrlContentMock.mockResolvedValueOnce(
    fs.readFileSync(
      path.join(".", "test", "resources", "project-dependencies.yaml")
    )
  );

  // Act
  const result = await readDefinitionFile(
    "https://raw.githubusercontent.com/kiegroup/build-chain-configuration-reader/main/test/resources/build-config.yaml",
    {
      urlPlaceHolders: {
        GROUP: "groupy",
        PROJECT_NAME: "projecty",
        BRANCH: "branchy"
      },
      token: "tokenX"
    }
  );

  // Assert
  expect(getUrlContentMock).toHaveBeenCalledWith(
    "https://raw.githubusercontent.com/kiegroup/build-chain-configuration-reader/main/test/resources/build-config.yaml",
    "tokenX"
  );
  expect(getUrlContentMock).toHaveBeenCalledWith(
    "http://whateverurl.rh/groupy/projecty/branchy/dependencies.yaml",
    "tokenX"
  );

  expect(Array.isArray(result.dependencies)).toBe(true);
  expect(result.dependencies.length).toEqual(25);
});

test("readDefinitionFile with external dependencies and extension", async () => {
  // Act
  const result = await readDefinitionFile(
    path.join(
      ".",
      "test",
      "resources",
      "build-config-from-dependencies-extension.yaml"
    )
  );
  // Assert
  expect(result.dependencies.length).toEqual(28);
});
