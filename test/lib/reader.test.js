const { readDefinitionFile } = require("../../src/lib/reader");
jest.mock("../../src/lib/util/http");
const { getUrlContent: getUrlContentMock } = require("../../src/lib/util/http");
const path = require("path");
const fs = require("fs");

afterEach(() => {
  jest.clearAllMocks();
});

describe("readDefinitionFile", () => {
  test("with dependencies", async () => {
    // Act
    const result = await readDefinitionFile(
      path.join(".", "test", "resources", "build-config-with-dependencies.yaml")
    );
    // Assert
    expect(result.dependencies.length).toEqual(25);
  });

  test("with external dependencies", async () => {
    // Act
    const result = await readDefinitionFile(
      path.join(".", "test", "resources", "build-config.yaml")
    );
    // Assert
    expect(result.dependencies.length).toEqual(25);
  });

  test("with external dependencies as URL", async () => {
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

  test("with external dependencies and extension", async () => {
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
});

describe("readDefinitionFileFromUrl", () => {
  test("relative embedded dependencies", async () => {
    // Arrange
    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(
        path.join(
          ".",
          "test",
          "resources",
          "build-config-with-dependencies.yaml"
        )
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

  test("relative path dependencies", async () => {
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

  test("url dependencies", async () => {
    // Arrange
    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(
        path.join(
          ".",
          "test",
          "resources",
          "build-config-dependencies-url.yaml"
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

  test("with place holders relative path dependencies", async () => {
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

  test("url dependencies placeholders", async () => {
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

  test("relative path dependencies. targetExpression", async () => {
    // Arrange
    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(path.join(".", "test", "resources", "build-config.yaml"))
    );
    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(
        path.join(
          ".",
          "test",
          "resources",
          "project-dependencies-target-expression.yaml"
        )
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
    const optaplannerMapping = result.dependencies
      .filter(node => node.project === "kiegroup/optaplanner")
      .map(node => node.mapping)[0];
    expect(optaplannerMapping.dependencies.default[0].target).toEqual(13);
    expect(optaplannerMapping.dependant.default[0].target).toEqual("main-x");
    expect(optaplannerMapping.dependant.projectx[0].target).toEqual(14);
    expect(optaplannerMapping.dependant.projecty[0].target).toEqual(undefined);
  });

  test("relative path dependencies. exclude", async () => {
    // Arrange
    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(path.join(".", "test", "resources", "build-config.yaml"))
    );
    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(
        path.join(".", "test", "resources", "project-dependencies-exclude.yaml")
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
    const optaplannerMapping = result.dependencies
      .filter(node => node.project === "kiegroup/optaplanner")
      .map(node => node.mapping)[0];
    expect(optaplannerMapping.dependencies.default[0].exclude).toEqual([
      "kiegroup/jbpm",
      "kiegroup/drools"
    ]);
    expect(optaplannerMapping.dependant.default[1].exclude).toEqual([
      "kiegroup/drools"
    ]);
  });
});

describe("readDefinitionFile with extends", () => {
  const resources = path.resolve(__dirname, "..", "resources");

  test("base definition file is from file path and extends is from file path", async () => {
    const result = await readDefinitionFile(
      path.join(resources, "extend-from-file.yaml")
    );
    const expected = await readDefinitionFile(
      path.join(resources, "build-config.yaml")
    );
    expect(result.version).toBe("2.2");
    expect(result.extends).toBe(undefined);
    expect(result.post).toBe(undefined);
    expect(result.pre).toBe("hello\nworld\n");
    expect(result.dependencies).toStrictEqual([
      ...expected.dependencies,
      {
        project: "kiegroup/new-project",
        dependencies: [{ project: "kiegroup/appformer" }]
      }
    ]);
    expect(result.default).toStrictEqual({
      "build-command": {
        current: "echo overriden",
        upstream:
          "mvn -e --builder smart -T1C clean install -DskipTests -Dgwt.compiler.skip=true -Dgwt.skipCompilation=true -Denforcer.skip=true -Dcheckstyle.skip=true -Dspotbugs.skip=true -Drevapi.skip=true",
        after: {
          upstream: "rm -rf ./*",
          downstream: "rm -rf ./*"
        }
      }
    });

    expect(result.build).toStrictEqual([
      {
        project: "kiegroup/appformer",
        "build-command": {
          upstream: "echo changed"
        },
        "archive-artifacts": {
          path: "**/dashbuilder-runtime.war\n**/something\n"
        }
      },
      {
        project: "kiegroup/new-project",
        "build-command": {
          current: "echo new-project"
        }
      },
      ...expected.build.filter(build => build.project !== "kiegroup/appformer")
    ]);
  });

  test("base definition file is from url and extends is from file path", async () => {
    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(path.join(resources, "extend-from-file.yaml"))
    );

    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(path.join(resources, "build-config.yaml"))
    );

    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(path.join(resources, "project-dependencies.yaml"))
    );

    const result = await readDefinitionFile(
      "https://whatever-url.com/definition-file.yaml"
    );

    expect(getUrlContentMock).toHaveBeenCalledTimes(3);
    expect(getUrlContentMock).toHaveBeenNthCalledWith(
      1,
      "https://whatever-url.com/definition-file.yaml",
      undefined
    );
    expect(getUrlContentMock).toHaveBeenNthCalledWith(
      2,
      "https://whatever-url.com/./build-config.yaml",
      undefined
    );
    expect(getUrlContentMock).toHaveBeenNthCalledWith(
      3,
      "https://whatever-url.com/././project-dependencies.yaml",
      undefined
    );

    const expected = await readDefinitionFile(
      path.join(resources, "build-config.yaml")
    );
    expect(result.version).toBe("2.2");
    expect(result.extends).toBe(undefined);
    expect(result.post).toBe(undefined);
    expect(result.pre).toBe("hello\nworld\n");
    expect(result.dependencies).toStrictEqual([
      ...expected.dependencies,
      {
        project: "kiegroup/new-project",
        dependencies: [{ project: "kiegroup/appformer" }]
      }
    ]);
    expect(result.default).toStrictEqual({
      "build-command": {
        current: "echo overriden",
        upstream:
          "mvn -e --builder smart -T1C clean install -DskipTests -Dgwt.compiler.skip=true -Dgwt.skipCompilation=true -Denforcer.skip=true -Dcheckstyle.skip=true -Dspotbugs.skip=true -Drevapi.skip=true",
        after: {
          upstream: "rm -rf ./*",
          downstream: "rm -rf ./*"
        }
      }
    });

    expect(result.build).toStrictEqual([
      {
        project: "kiegroup/appformer",
        "build-command": {
          upstream: "echo changed"
        },
        "archive-artifacts": {
          path: "**/dashbuilder-runtime.war\n**/something\n"
        }
      },
      {
        project: "kiegroup/new-project",
        "build-command": {
          current: "echo new-project"
        }
      },
      ...expected.build.filter(build => build.project !== "kiegroup/appformer")
    ]);
  });

  test("extends is from url", async () => {
    // for getting the definition file from https://whatever.url.com/definition-file.yml
    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(path.join(resources, "build-config.yaml"))
    );

    // for getting the dependency file for the extended definition file from https://whatever.url.com/definition-file.yml/./project-dependencies.yml
    getUrlContentMock.mockResolvedValueOnce(
      fs.readFileSync(path.join(resources, "project-dependencies.yaml"))
    );

    const result = await readDefinitionFile(
      path.join(resources, "extend-from-url.yaml")
    );

    expect(getUrlContentMock).toHaveBeenCalledTimes(2);
    expect(getUrlContentMock).toHaveBeenNthCalledWith(
      1,
      "https://whatever-url.com/definition-file.yaml",
      undefined
    );
    expect(getUrlContentMock).toHaveBeenNthCalledWith(
      2,
      "https://whatever-url.com/./project-dependencies.yaml",
      undefined
    );

    const expected = await readDefinitionFile(
      path.join(resources, "build-config.yaml")
    );
    expect(result.version).toBe("2.2");
    expect(result.extends).toBe(undefined);
    expect(result.pre).toBe("world\n");
    expect(result.post).toBe("hello");
    expect(result.dependencies).toStrictEqual([
      ...expected.dependencies,
      {
        project: "kiegroup/new-project",
        dependencies: [{ project: "kiegroup/appformer" }]
      }
    ]);
    expect(result.default).toStrictEqual({
      "build-command": {
        current: "echo overriden",
        upstream:
          "mvn -e --builder smart -T1C clean install -DskipTests -Dgwt.compiler.skip=true -Dgwt.skipCompilation=true -Denforcer.skip=true -Dcheckstyle.skip=true -Dspotbugs.skip=true -Drevapi.skip=true",
        after: {
          upstream: "rm -rf ./*",
          downstream: "rm -rf ./*"
        }
      }
    });

    expect(result.build).toStrictEqual([
      {
        project: "kiegroup/appformer",
        "build-command": {
          upstream: "echo changed"
        },
        "archive-artifacts": {
          path: "**/dashbuilder-runtime.war\n**/something\n"
        }
      },
      {
        project: "kiegroup/new-project",
        "build-command": {
          current: "echo new-project"
        }
      },
      ...expected.build.filter(build => build.project !== "kiegroup/appformer")
    ]);
  });
});
