const { read } = require("../../../src/lib/util/yaml");
const path = require("path");
const fs = require("fs");

test("read YamlFile", () => {
  // Arrange
  const fileContent = fs.readFileSync(
    path.join(".", "test", "resources", "build-config.yaml")
  );
  // Act
  const yamlData = read(fileContent);
  // Assert
  expect(yamlData.dependencies).toEqual("./project-dependencies.yaml");
  expect(yamlData.build.length).toEqual(10);
});
