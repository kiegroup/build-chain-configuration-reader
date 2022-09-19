import { validateDefinitionFile } from "@bc-cr/util/yaml";
import { readdirSync, readFileSync } from "fs";
import path from "path";
const resourcePath = path.resolve(__dirname, "..", "resources", "schema-tests");

describe("version validation", () => {
  const versionPath = path.join(resourcePath, "version");
  test.each([
    ["no version", path.join(versionPath, "missing.yml")],
    ["incorrect version", path.join(versionPath, "incorrect.yml")],
  ])("%p", async (_title: string, testFile: string) => {
    await expect(
      validateDefinitionFile(readFileSync(testFile, "utf8"))
    ).rejects.toThrowError();
  });

  test("correct version", async () => {
    await expect(
      validateDefinitionFile(
        readFileSync(path.join(versionPath, "correct.yml"), "utf8")
      )
    ).resolves.toMatchObject({ version: "2.1" });
  });
});

describe("dependencies validation", () => {
  const dependenciesPath = path.join(resourcePath, "dependencies");
  test.each([
    ["no dependencies", path.join(dependenciesPath, "missing.yml")],
    [
      "incorrect dependencies: not a string or an array",
      path.join(dependenciesPath, "incorrect-type.yml"),
    ],
    [
      "incorrect dependencies: invalid project name",
      path.join(dependenciesPath, "incorrect-project-name.yml"),
    ],
  ])("%p", async (_title: string, testFile: string) => {
    await expect(
      validateDefinitionFile(readFileSync(testFile, "utf8"))
    ).rejects.toThrowError();
  });

  test.each([
    [
      "correct dependencies: array",
      path.join(dependenciesPath, "correct-array.yml"),
      {
        dependencies: [
          {
            project: "kiegroup/appformer",
          },
          {
            project: "owner/project",
          },
        ],
      },
    ],
    [
      "correct dependencies: string",
      path.join(dependenciesPath, "correct-string.yml"),
      {
        dependencies: "http://some-dependency",
      },
    ],
  ])(
    "%p",
    async (
      _title: string,
      testFile: string,
      expected: Record<string, unknown>
    ) => {
      await expect(
        validateDefinitionFile(readFileSync(testFile, "utf8"))
      ).resolves.toMatchObject(expected);
    }
  );
});

describe("default validation", () => {
  const defaultPath = path.join(resourcePath, "default");
  test("incorrect default: not an object", async () => {
    await expect(
      validateDefinitionFile(
        readFileSync(path.join(defaultPath, "incorrect.yml"), "utf8")
      )
    ).rejects.toThrowError();
  });

  test("correct default", async () => {
    await expect(
      validateDefinitionFile(
        readFileSync(path.join(defaultPath, "correct.yml"), "utf8")
      )
    ).resolves.toMatchObject({
      default: {
        "build-command": {
          current: ["echo"],
          upstream: [],
          downstream: [],
        },
      },
    });
  });
});

describe("dependencies.dependencies validation", () => {
  const dependenciesPath = path.join(
    resourcePath,
    "dependencies",
    "dependencies"
  );

  test("incorrect dependencies.dependencies", async () => {
    await expect(
      validateDefinitionFile(
        readFileSync(path.join(dependenciesPath, "incorrect.yml"), "utf8")
      )
    ).rejects.toThrowError();
  });

  test("correct dependencies.dependencies", async () => {
    await expect(
      validateDefinitionFile(
        readFileSync(path.join(dependenciesPath, "correct.yml"), "utf8")
      )
    ).resolves.toMatchObject({
      dependencies: [
        {
          project: "abc/def",
          dependencies: [
            {
              project: "kie/project",
            },
            {
              project: "owner/project",
            },
          ],
        },
      ],
    });
  });
});

describe("dependencies.mapping validation", () => {
  const mappingPath = path.join(resourcePath, "dependencies", "mapping");
  test.each([
    ["no dependencies and dependant", path.join(mappingPath, "missing.yml")],
    ["no default", path.join(mappingPath, "missing-default.yml")],
    [
      "incorrect source and target",
      path.join(mappingPath, "incorrect-source-to-target.yml"),
    ],
    [
      "incorrect project name as key",
      path.join(mappingPath, "incorrect-project-name-key.yml"),
    ],
    [
      "incorrect dependency/dependant type",
      path.join(mappingPath, "incorrect-type.yml"),
    ],
    ["incorrect exclude", path.join(mappingPath, "incorrect-exclude.yml")],
  ])("%p", async (_title: string, testFile: string) => {
    await expect(
      validateDefinitionFile(readFileSync(testFile, "utf8"))
    ).rejects.toThrowError();
  });

  test.each([
    [
      "correct using default exclude",
      path.join(mappingPath, "correct-default-exclude.yml"),
      [],
    ],
    ["correct", path.join(mappingPath, "correct.yml"), ["abc/def"]],
  ])(
    "%p",
    async (_title: string, testFile: string, expectedExclude: string[]) => {
      await expect(
        validateDefinitionFile(readFileSync(testFile, "utf8"))
      ).resolves.toMatchObject({
        dependencies: [
          {
            project: "kiegroup/appformer",
            mapping: {
              dependencies: {
                default: [{ source: "7.x", target: "main" }],
                "owner/project": [
                  { source: "8.x", target: "main" },
                  { source: "6.x", targetExpression: "expression" },
                ],
              },
              dependant: {
                default: [{ source: "7.x", target: "main" }],
                "kie/project": [
                  { source: "8.x", target: "main" },
                  { source: "6.x", targetExpression: "expression" },
                ],
              },
              exclude: expectedExclude,
            },
          },
        ],
      });
    }
  );
});

describe("build", () => {
  const buildPath = path.join(resourcePath, "build");
  test.each([
    [
      "incorrect type: not an array",
      path.join(buildPath, "incorrect-type.yml"),
    ],
    [
      "incorrect project name",
      path.join(buildPath, "incorrect-project-name.yml"),
    ],
  ])("%p", async (_title: string, testFile: string) => {
    await expect(
      validateDefinitionFile(readFileSync(testFile, "utf8"))
    ).rejects.toThrowError();
  });

  test("correct", async () => {
    await expect(
      validateDefinitionFile(
        readFileSync(path.join(buildPath, "correct.yml"), "utf8")
      )
    ).resolves.toMatchObject({
      build: [
        {
          project: "owner/project",
          "build-command": { current: ["echo"] },
        },
        {
          project: "owner/project",
          "build-command": { current: ["echo"] },
        },
      ],
    });
  });
});

describe("build.build-command", () => {
  const buildCommandPath = path.join(resourcePath, "build", "build-command");

  test("missing build-command and missing all of the keys in build-command", async () => {
    await expect(
      validateDefinitionFile(
        readFileSync(path.join(buildCommandPath, "missing.yml"), "utf8")
      )
    ).rejects.toThrowError();
  });

  test("correct build-command", async () => {
    await expect(
      validateDefinitionFile(
        readFileSync(path.join(buildCommandPath, "correct.yml"), "utf8")
      )
    ).resolves.toMatchObject({
      build: [
        { project: "owner/project", "build-command": { current: ["echo"] } },
        { project: "owner/project", "build-command": { upstream: ["echo"] } },
        { project: "owner/project", "build-command": { downstream: ["echo"] } },
        {
          project: "owner/project",
          "build-command": { before: { current: ["echo"] } },
        },
        {
          project: "owner/project",
          "build-command": { after: { upstream: ["echo"] } },
        },
        {
          project: "owner/project",
          "build-command": {
            current: ["echo 1", "echo 2"],
            after: { upstream: ["echo"], downstream: ["echo2"] },
            before: {
              upstream: ["echo"],
              downstream: ["echo"],
              current: ["echo"],
            },
            upstream: ["echo"],
          },
        },
      ],
    });
  });
});

describe("build.archive-artifacts", () => {
  const archiveArtifactsPath = path.join(
    resourcePath,
    "build",
    "archive-artifacts"
  );

  test.each([
    ["missing keys", path.join(archiveArtifactsPath, "missing.yml")],
    [
      "incorrect project name",
      path.join(archiveArtifactsPath, "incorrect-project-name.yml"),
    ],
    [
      "incorrect dependencies",
      path.join(archiveArtifactsPath, "incorrect-dependencies.yml"),
    ],
  ])("%p", async (_title: string, testFile: string) => {
    await expect(
      validateDefinitionFile(readFileSync(testFile, "utf8"))
    ).rejects.toThrowError();
  });

  test("correct archive-artifacts", async () => {
    await expect(
      validateDefinitionFile(
        readFileSync(path.join(archiveArtifactsPath, "correct.yml"), "utf8")
      )
    ).resolves.toMatchObject({
      build: [
        {
          project: "owner/project",
          "build-command": {
            current: ["echo"],
            upstream: [],
            downstream: [],
          },
          "archive-artifacts": {
            name: "archive",
            dependencies: "none",
            paths: [
              { path: "hello", on: "success" },
              { path: "hello2", on: "success" },
            ],
            "if-no-files-found": "warn",
          },
        },
        {
          project: "owner/project",
          "build-command": {
            current: ["echo"],
            upstream: [],
            downstream: [],
          },
          "archive-artifacts": {
            name: "archive",
            dependencies: "all",
            paths: [{ path: "hello", on: "success" }],
            "if-no-files-found": "warn",
          },
        },
        {
          project: "owner/project",
          "build-command": {
            current: ["echo"],
            upstream: [],
            downstream: [],
          },
          "archive-artifacts": {
            name: "archive",
            dependencies: "none",
            paths: [{ path: "hello", on: "success" }],
            "if-no-files-found": "warn",
          },
        },
        {
          project: "owner/project",
          "build-command": {
            current: ["echo"],
            upstream: [],
            downstream: [],
          },
          "archive-artifacts": {
            name: "archive",
            dependencies: ["ownerA/projectA", "ownerB/projectB"],
            paths: [{ path: "hello", on: "success" }],
            "if-no-files-found": "warn",
          },
        },
      ],
    });
  });
});

describe("works for definition file examples from older versions", () => {
  const backportPath = path.join(resourcePath, "backport");
  test("correct", async () => {
    const files = readdirSync(backportPath);
    await Promise.all(
      files.map(file =>
        expect(
          validateDefinitionFile(
            readFileSync(path.join(backportPath, file), "utf8")
          )
        ).resolves.not.toThrowError()
      )
    );
  });
});
