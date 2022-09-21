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
    expect(definitionFile).toStrictEqual({
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
      token
    );
    expect(definitionFile).toStrictEqual({
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
    expect(definitionFile).toStrictEqual({
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

describe("get dependencies", () => {
  test.each([
    ["dependencies", path.join(resourcePath, "dependencies-as-file.yml"), 2],
    ["extends", path.join(resourcePath, "extends-as-file.yml"), 4],
  ])(
    "%p defined as a file path",
    async (
      _title: string,
      filePath: string,
      expectedNumOfDependencies: number
    ) => {
      const definitionFile = await readDefinitionFile(filePath);
      expect(definitionFile).toStrictEqual({
        version: "2.1",
        dependencies: Array(expectedNumOfDependencies).fill({
          project: "owner1/project1",
        }),
      });
    }
  );

  test.each([
    ["dependencies", path.join(resourcePath, "dependencies-as-url.yml"), 2],
    ["extends", path.join(resourcePath, "extends-as-url.yml"), 4],
  ])(
    "%p defined as a url",
    async (
      _title: string,
      filePath: string,
      expectedNumOfDependencies: number
    ) => {
      nock("https://definitionfile.com")
        .get("/content.yml")
        .replyWithFile(200, path.join(resourcePath, "content.yml"));
      const definitionFile = await readDefinitionFile(filePath);
      expect(definitionFile).toStrictEqual({
        version: "2.1",
        dependencies: Array(expectedNumOfDependencies).fill({
          project: "owner1/project1",
        }),
      });
    }
  );

  test.each([
    ["dependencies", path.join(resourcePath, "nested-dependencies.yml")],
    ["extends", path.join(resourcePath, "nested-extends.yml")],
  ])("nested %p", async (_title: string, filePath: string) => {
    await expect(readDefinitionFile(filePath)).rejects.toThrowError();
  });
});

describe("target expression to target", () => {
  test("target expression to target", async () => {
    process.env["DUMMY_VAR"] = "dummy_var";
    const definitionFile = await readDefinitionFile(
      path.join(resourcePath, "target-expression-to-target.yml")
    );
    expect(definitionFile).toStrictEqual({
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
