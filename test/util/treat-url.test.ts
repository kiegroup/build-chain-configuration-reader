import { treatUrl } from "@bc-cr/util/treat-url";

describe("replace placeholders", () => {
  test("default value defined in the url", () => {
    const url =
      "https://abc/${GROUP:group}/${PROJECT_NAME:project}/${BRANCH:main}/${TEST:test}";
    const treatedUrl = "https://abc/group/project/main/test";
    expect(treatUrl(url)).toBe(treatedUrl);
  });

  test("default value defined in the env", () => {
    const url = "https://abc/${GROUP}/${PROJECT_NAME}/${BRANCH}/${TEST}";

    process.env = {
      ...process.env,
      GROUP: "group",
      PROJECT_NAME: "project",
      BRANCH: "main",
      TEST: "test",
    };

    const treatedUrl = "https://abc/group/project/main/test";
    expect(treatUrl(url)).toBe(treatedUrl);

    delete process.env["GROUP"];
    delete process.env["PROJECT_NAME"];
    delete process.env["BRANCH"];
    delete process.env["TEST"];
  });

  test("no default value", () => {
    const url = "https://abc/${GROUP}/${PROJECT_NAME}/${BRANCH}/${TEST}";
    const treatedUrl = "https://abc/group/project/main/";
    expect(treatUrl(url, "group", "project", "main")).toBe(treatedUrl);
  });

  test("no placeholders", () => {
    const url = "https://abc/def";
    expect(treatUrl(url, "group", "project", "main")).toBe(url);
  });
});

describe("replace expressions", () => {
  test("expression executed successfully", () => {
    const url = "https://abc/testfile%{new Number(3).toString()}.txt";
    const treatedUrl = "https://abc/testfile3.txt";
    expect(treatUrl(url)).toBe(treatedUrl);
  });

  test("expression executed successfully where expression contains placeholder looking like characters", () => {
    process.env.GITHUB_BASE_REF = "8.13.x";
    const url =
      "https://raw.githubusercontent.com/kiegroup/kogito-pipelines/%{process.env.GITHUB_BASE_REF.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1-7}.${n2}.${n3}`)}/.ci/pull-request-config.yaml";
    const treatedUrl = "https://raw.githubusercontent.com/kiegroup/kogito-pipelines/1.13.x/.ci/pull-request-config.yaml";
    expect(treatUrl(url)).toBe(treatedUrl);
    delete process.env["GITHUB_BASE_REF"];
  });

  test("expression execution failed", () => {
    const url = "https://abc/testfile%{new Integer(3).toString()}.txt";
    const treatedUrl = "https://abc/testfileundefined.txt";
    expect(treatUrl(url)).toBe(treatedUrl);
  });

  test("no expression", () => {
    const url = "https://abc/def";
    expect(treatUrl(url)).toBe(url);
  });
});

describe("replace placeholder and expressions", () => {
  test("success", () => {
    const url =
      "https://abc/${TEST:test}/testfile%{new Number(3).toString()}.txt";
    const treatedUrl = "https://abc/test/testfile3.txt";
    expect(treatUrl(url)).toBe(treatedUrl);
  });

  test("success where expression contains placeholder looking like characters", () => {
    process.env["GITHUB_BASE_REF"] = "8.13.x";
    const url =
      "https://raw.githubusercontent.com/${GROUP}/kogito-pipelines/%{process.env.GITHUB_BASE_REF.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1-7}.${n2}.${n3}`)}/.ci/pull-request-config.yaml";
    const treatedUrl = "https://raw.githubusercontent.com/kiegroup/kogito-pipelines/1.13.x/.ci/pull-request-config.yaml";
    expect(treatUrl(url, "kiegroup")).toBe(treatedUrl);
    delete process.env["GITHUB_BASE_REF"];
  });
});
