import { readDefinitionFile } from "@bc-cr/reader";
import nock from "nock";
import path from "path";

const resourcePath = path.join(__dirname, "resources", "reader-tests");
describe("get content", () => {
  test("from url: success without token", async () => {
    nock("https://definitionfile.com")
      .get("/content.yml")
      .replyWithFile(200, path.join(resourcePath, "content.yml"));
    const definitionFile = await readDefinitionFile(
      "https://definitionfile.com/content.yml"
    );
    expect(definitionFile).toEqual({
      version: "2.1",
      dependencies: Array(2).fill({
        project: "owner1/project1",
      }),
    });
  });

  test("from url: success with token", async () => {
    const token = "fakeToken";
    nock("https://definitionfile.com")
      .get("/content.yml")
      .matchHeader("Authorization", `Bearer ${token}`)
      .replyWithFile(200, path.join(resourcePath, "content.yml"));
    const definitionFile = await readDefinitionFile(
      "https://definitionfile.com/content.yml",
      { token }
    );
    expect(definitionFile).toEqual({
      version: "2.1",
      dependencies: Array(2).fill({
        project: "owner1/project1",
      }),
    });
  });

  test("from url: failure", async () => {
    nock("https://definitionfile.com").get("/content.yml").reply(404);
    await expect(
      readDefinitionFile("https://definitionfile.com/content.yml")
    ).rejects.toThrowError();
  });

  test("from file: success", async () => {
    const definitionFile = await readDefinitionFile(
      path.join(resourcePath, "content.yml")
    );
    expect(definitionFile).toEqual({
      version: "2.1",
      dependencies: Array(2).fill({
        project: "owner1/project1",
      }),
    });
  });

  test("from file: failure", async () => {
    await expect(
      readDefinitionFile(path.join(resourcePath, "content"))
    ).rejects.toThrowError();
  });
});

describe("target expression to target", () => {
  test("target expression to target", async () => {
    process.env["DUMMY_VAR"] = "dummy_var";
    const definitionFile = await readDefinitionFile(
      path.join(resourcePath, "target-expression-to-target.yml")
    );
    expect(definitionFile).toEqual({
      version: "2.1",
      dependencies: [
        {
          project: "owner1/project1",
          dependencies: [{ project: "owner2/project2" }],
          mapping: {
            dependencies: {
              default: [
                { source: "7.x", target: "main" },
                { source: "8.x", target: "8.x.y" },
              ],
              "owner2/project2": [{ source: "9.x", target: "dummy_var" }],
            },
            exclude: [],
          },
        },
        {
          project: "owner2/project2",
          dependencies: [{ project: "owner3/project3" }],
          mapping: {
            dependant: {
              default: [
                { source: "7.x", target: "main" },
                { source: "8.x", target: "8.x.y" },
              ],
              "owner3/project3": [{ source: "9.x", target: "dummy_var" }],
            },
            exclude: [],
          },
        },
        {
          project: "owner3/project3",
          dependencies: [
            { project: "owner4/project4" },
            { project: "owner5/project5" },
          ],
          mapping: {
            dependencies: {
              default: [
                { source: "7.x", target: "main" },
                { source: "8.x", target: "8.x.y" },
              ],
              "owner3/project3": [{ source: "9.x", target: "dummy_var" }],
            },
            dependant: {
              default: [
                { source: "7.x", target: "main" },
                { source: "8.x", target: "8.x.y" },
              ],
              "owner3/project3": [{ source: "9.x", target: "dummy_var" }],
            },
            exclude: [],
          },
        },
      ],
    });
    delete process.env["DUMMY_VAR"];
  });
});

describe("definition file with extends", () => {
  const buildConfigFile = path.resolve(
    resourcePath,
    "..",
    "schema-tests",
    "backport",
    "build-config.yaml"
  );

  const projectDependenciesFile = path.resolve(
    resourcePath,
    "..",
    "schema-tests",
    "backport",
    "project-dependencies.yaml"
  );

  test("base definition file is from file path and extends is from file path", async () => {
    const result = await readDefinitionFile(
      path.join(resourcePath, "extend-from-file.yaml")
    );
    const expected = await readDefinitionFile(buildConfigFile);
    expect(result.version).toBe("2.2");
    expect(result.extends).toBe(undefined);
    expect(result.post).toBe(undefined);
    expect(result.pre).toStrictEqual(["hello", "world"]);
    expect(result.dependencies).toEqual([
      ...expected.dependencies!,
      {
        project: "kiegroup/new-project",
        dependencies: [{ project: "kiegroup/appformer" }],
      },
    ]);
    expect(result.default).toEqual({
      "build-command": {
        downstream: [],
        current: ["echo overriden"],
        upstream: [
          "mvn -e --builder smart -T1C clean install -DskipTests -Dgwt.compiler.skip=true -Dgwt.skipCompilation=true -Denforcer.skip=true -Dcheckstyle.skip=true -Dspotbugs.skip=true -Drevapi.skip=true",
        ],
        after: {
          current: [],
          upstream: ["rm -rf ./*"],
          downstream: ["rm -rf ./*"],
        },
      },
    });

    expect(result.build).toEqual([
      {
        project: "kiegroup/appformer",
        "build-command": {
          upstream: ["echo changed"],
          current: [],
          downstream: [],
        },
        "archive-artifacts": {
          dependencies: "none",
          "if-no-files-found": "warn",
          paths: [
            {
              on: "success",
              path: "**/dashbuilder-runtime.war",
            },
            {
              on: "success",
              path: "**/something",
            },
          ],
        },
      },
      {
        project: "kiegroup/new-project",
        "build-command": {
          current: ["echo new-project"],
          upstream: [],
          downstream: [],
        },
      },
      ...expected.build!.filter(
        build => build.project !== "kiegroup/appformer"
      ),
    ]);
  });

  test("base definition file is from url and extends is from file path", async () => {
    nock("https://whatever-url.com")
      .get("/definition-file.yaml")
      .replyWithFile(200, path.join(resourcePath, "extend-from-file.yaml"))
      .get("/../schema-tests/backport/build-config.yaml")
      .replyWithFile(200, buildConfigFile)
      .get("/../schema-tests/backport/./project-dependencies.yaml")
      .replyWithFile(200, projectDependenciesFile);

    const result = await readDefinitionFile(
      "https://whatever-url.com/definition-file.yaml"
    );

    const expected = await readDefinitionFile(buildConfigFile);
    expect(result.version).toBe("2.2");
    expect(result.extends).toBe(undefined);
    expect(result.post).toBe(undefined);
    expect(result.pre).toStrictEqual(["hello", "world"]);
    expect(result.dependencies).toEqual([
      ...expected.dependencies!,
      {
        project: "kiegroup/new-project",
        dependencies: [{ project: "kiegroup/appformer" }],
      },
    ]);
    expect(result.default).toEqual({
      "build-command": {
        current: ["echo overriden"],
        upstream: [
          "mvn -e --builder smart -T1C clean install -DskipTests -Dgwt.compiler.skip=true -Dgwt.skipCompilation=true -Denforcer.skip=true -Dcheckstyle.skip=true -Dspotbugs.skip=true -Drevapi.skip=true",
        ],
        downstream: [],
        after: {
          upstream: ["rm -rf ./*"],
          downstream: ["rm -rf ./*"],
          current: [],
        },
      },
    });

    expect(result.build).toEqual([
      {
        project: "kiegroup/appformer",
        "build-command": {
          upstream: ["echo changed"],
          current: [],
          downstream: [],
        },
        "archive-artifacts": {
          dependencies: "none",
          "if-no-files-found": "warn",
          paths: [
            {
              on: "success",
              path: "**/dashbuilder-runtime.war",
            },
            {
              on: "success",
              path: "**/something",
            },
          ],
        },
      },
      {
        project: "kiegroup/new-project",
        "build-command": {
          current: ["echo new-project"],
          upstream: [],
          downstream: [],
        },
      },
      ...expected.build!.filter(
        build => build.project !== "kiegroup/appformer"
      ),
    ]);
  });

  test("extends is from url", async () => {
    nock("https://whatever-url.com")
      .get("/definition-file.yaml")
      .replyWithFile(200, buildConfigFile)
      .get("/./project-dependencies.yaml")
      .replyWithFile(200, projectDependenciesFile);

    const result = await readDefinitionFile(
      path.join(resourcePath, "extend-from-url.yaml")
    );

    const expected = await readDefinitionFile(buildConfigFile);
    expect(result.version).toBe("2.2");
    expect(result.extends).toBe(undefined);
    expect(result.pre).toStrictEqual(["world"]);
    expect(result.post).toStrictEqual({success: ["hello"]});
    expect(result.dependencies).toEqual([
      ...expected.dependencies!,
      {
        project: "kiegroup/new-project",
        dependencies: [{ project: "kiegroup/appformer" }],
      },
    ]);
    expect(result.default).toEqual({
      "build-command": {
        current: ["echo overriden"],
        downstream: [],
        upstream: [
          "mvn -e --builder smart -T1C clean install -DskipTests -Dgwt.compiler.skip=true -Dgwt.skipCompilation=true -Denforcer.skip=true -Dcheckstyle.skip=true -Dspotbugs.skip=true -Drevapi.skip=true",
        ],
        after: {
          upstream: ["rm -rf ./*"],
          downstream: ["rm -rf ./*"],
          current: [],
        },
      },
    });

    expect(result.build).toEqual([
      {
        project: "kiegroup/appformer",
        "build-command": {
          upstream: ["echo changed"],
          current: [],
          downstream: [],
        },
        "archive-artifacts": {
          dependencies: "none",
          "if-no-files-found": "warn",
          paths: [
            {
              on: "success",
              path: "**/dashbuilder-runtime.war",
            },
            {
              on: "success",
              path: "**/something",
            },
          ],
        },
      },
      {
        project: "kiegroup/new-project",
        "build-command": {
          current: ["echo new-project"],
          upstream: [],
          downstream: [],
        },
      },
      ...expected.build!.filter(
        build => build.project !== "kiegroup/appformer"
      ),
    ]);
  });

  test("extend when dependencies is from a file", async () => {
    const result = await readDefinitionFile(
      path.join(resourcePath, "extend-with-dependency-from-file.yaml")
    );
    const expected = await readDefinitionFile(buildConfigFile);
    expect(result.version).toBe("2.2");
    expect(result.extends).toBe(undefined);
    expect(result.dependencies).toEqual([
      ...expected.dependencies!,
      {
        project: "kiegroup/new-project",
        dependencies: [{ project: "kiegroup/appformer" }],
      },
    ]);
    expect(result.default).toEqual({
      "build-command": {
        current: ["echo overriden"],
        downstream: [],
        upstream: [
          "mvn -e --builder smart -T1C clean install -DskipTests -Dgwt.compiler.skip=true -Dgwt.skipCompilation=true -Denforcer.skip=true -Dcheckstyle.skip=true -Dspotbugs.skip=true -Drevapi.skip=true",
        ],
        after: {
          upstream: ["rm -rf ./*"],
          downstream: ["rm -rf ./*"],
          current: [],
        },
      },
    });

    expect(result.build).toEqual([
      {
        project: "kiegroup/appformer",
        "build-command": {
          upstream: ["echo changed"],
          current: [],
          downstream: [],
        },
        "archive-artifacts": {
          dependencies: "none",
          "if-no-files-found": "warn",
          paths: [
            {
              on: "success",
              path: "**/dashbuilder-runtime.war",
            },
            {
              on: "success",
              path: "**/something",
            },
          ],
        },
      },
      {
        project: "kiegroup/new-project",
        "build-command": {
          current: ["echo new-project"],
          upstream: [],
          downstream: [],
        },
      },
      ...expected.build!.filter(
        build => build.project !== "kiegroup/appformer"
      ),
    ]);
  });

  test("multilevel extension", async () => {
    const result = await readDefinitionFile(
      path.join(resourcePath, "extend-multilevel.yaml")
    );
    const expected = await readDefinitionFile(buildConfigFile);
    expect(result.version).toBe("2.2");
    expect(result.extends).toBe(undefined);
    expect(result.post).toBe(undefined);
    expect(result.pre).toStrictEqual(["hello", "world"]);
    expect(result.dependencies).toEqual([
      ...expected.dependencies!,
      {
        project: "kiegroup/new-project",
        dependencies: [{ project: "kiegroup/appformer" }],
      },
    ]);
    expect(result.default).toEqual({
      "build-command": {
        current: ["echo overriden again"],
        downstream: [],
        upstream: [
          "mvn -e --builder smart -T1C clean install -DskipTests -Dgwt.compiler.skip=true -Dgwt.skipCompilation=true -Denforcer.skip=true -Dcheckstyle.skip=true -Dspotbugs.skip=true -Drevapi.skip=true",
        ],
        after: {
          upstream: ["rm -rf ./*"],
          downstream: ["echo overriden"],
          current: [],
        },
      },
    });

    expect(result.build).toEqual([
      {
        project: "kiegroup/appformer",
        "build-command": {
          upstream: ["echo changed again"],
          current: [],
          downstream: [],
        },
        "archive-artifacts": {
          dependencies: "none",
          "if-no-files-found": "warn",
          paths: [
            {
              on: "success",
              path: "**/dashbuilder-runtime.war",
            },
            {
              on: "success",
              path: "**/something",
            },
          ],
        },
      },
      {
        project: "kiegroup/new-project",
        "build-command": {
          current: ["echo updated"],
          downstream: [],
          upstream: [],
        },
      },
      ...expected.build!.filter(
        build => build.project !== "kiegroup/appformer"
      ),
    ]);
  });
});
