const { getUrlContent } = require("../../../src/lib/util/http");

afterEach(() => {
  jest.clearAllMocks();
});

test("getUrlContent HTTPS OK", async () => {
  // Act
  const result = await getUrlContent(
    "https://raw.githubusercontent.com/kiegroup/github-action-build-chain/master/package.json"
  );
  // Assert
  expect(result).not.toBeUndefined();
});

test("getUrlContent HTTP OK", async () => {
  // Act
  try {
    await getUrlContent("http://www.redhat.com");
  } catch (e) {
    expect(e.message).toBe(
      "Error getting http://www.redhat.com. Error: Status: 301. Moved Permanently"
    );
  }
});
