const {
  treatProject
} = require("../../../src/lib/helper/definition-interpreter");

const buildConfiguration = {
  default: {
    "build-command": {
      current: "mvn current1\nmvn current2",
      upstream: "mvn upstream",
      before: {
        current: "mvn before current",
        upstream: "mvn before upstream"
      },
      after: {
        current: "mvn after current",
        upstream: "mvn after upstream1\nmvn after upstream2"
      }
    },
    "archive-artifacts": {
      path: "**/dashbuilder-runtime.war@always\n**/dashbuilder-runtime2.war",
      name: "artifactName",
      "if-no-files-found": "error",
      dependencies: "all"
    }
  },
  build: [
    {
      project: "projectA",
      "build-command": {
        upstream: "mvn upstream1 projectA\nmvn upstream2 projectA"
      },
      "archive-artifacts": {
        path: "**/projectA.war"
      }
    },
    {
      project: "projectB",
      "build-command": {
        current: ["mvn upstream1 projectB", "mvn upstream2 projectB"],
        before: {
          upstream: "mvn before upstream projectB"
        },
        after: {
          current: "mvn after current projectB"
        }
      },
      "archive-artifacts": {
        name: "projectBartifactName",
        "if-no-files-found": "warn",
        dependencies: "none"
      }
    }
  ]
};

const buildConfigurationNoDefault = {
  build: [
    {
      project: "projectC",
      "build-command": {
        current: ["mvn upstream1 projectC", "mvn upstream2 projectC"],
        before: {
          upstream: "mvn before upstream projectC"
        },
        after: {
          current: "mvn after current projectC"
        }
      },
      "archive-artifacts": {
        path: "whateverpath"
      }
    }
  ]
};

test("treatProject no project defined", async () => {
  // Arrange
  const expected = {
    "build-command": {
      current: ["mvn current1", "mvn current2"],
      upstream: "mvn upstream",
      before: {
        current: "mvn before current",
        upstream: "mvn before upstream"
      },
      after: {
        current: "mvn after current",
        upstream: ["mvn after upstream1", "mvn after upstream2"]
      }
    },
    "archive-artifacts": {
      path: [
        "**/dashbuilder-runtime.war@always",
        "**/dashbuilder-runtime2.war"
      ],
      name: "artifactName",
      "if-no-files-found": "error",
      dependencies: "all",
      paths: [
        {
          on: "always",
          path: "**/dashbuilder-runtime.war"
        },
        {
          on: "success",
          path: "**/dashbuilder-runtime2.war"
        }
      ]
    }
  };
  // Act
  const result = treatProject("projectX", buildConfiguration);

  // Assert
  expect(expected).toEqual(result.build);
});

test("treatProject projectA", async () => {
  // Arrange
  const expected = {
    "build-command": {
      current: ["mvn current1", "mvn current2"],
      upstream: ["mvn upstream1 projectA", "mvn upstream2 projectA"],
      before: {
        current: "mvn before current",
        upstream: "mvn before upstream"
      },
      after: {
        current: "mvn after current",
        upstream: ["mvn after upstream1", "mvn after upstream2"]
      }
    },
    "archive-artifacts": {
      path: "**/projectA.war",
      name: "artifactName",
      "if-no-files-found": "error",
      dependencies: "all",
      paths: [
        {
          on: "success",
          path: "**/projectA.war"
        }
      ]
    }
  };
  // Act
  const result = treatProject("projectA", buildConfiguration);

  // Assert
  expect(expected).toEqual(result.build);
});

test("treatProject projectB", async () => {
  // Arrange
  const expected = {
    "build-command": {
      current: ["mvn upstream1 projectB", "mvn upstream2 projectB"],
      upstream: "mvn upstream",
      before: {
        current: "mvn before current",
        upstream: "mvn before upstream projectB"
      },
      after: {
        current: "mvn after current projectB",
        upstream: ["mvn after upstream1", "mvn after upstream2"]
      }
    },
    "archive-artifacts": {
      path: [
        "**/dashbuilder-runtime.war@always",
        "**/dashbuilder-runtime2.war"
      ],
      name: "projectBartifactName",
      "if-no-files-found": "warn",
      dependencies: "none",
      paths: [
        {
          on: "always",
          path: "**/dashbuilder-runtime.war"
        },
        {
          on: "success",
          path: "**/dashbuilder-runtime2.war"
        }
      ]
    }
  };
  // Act
  const result = treatProject("projectB", buildConfiguration);

  // Assert
  expect(expected).toEqual(result.build);
});

test("treatProject projectC", async () => {
  // Arrange
  const expected = {
    "build-command": {
      current: ["mvn upstream1 projectC", "mvn upstream2 projectC"],
      before: {
        upstream: "mvn before upstream projectC"
      },
      after: {
        current: "mvn after current projectC"
      }
    },
    "archive-artifacts": {
      path: "whateverpath",
      name: "projectC",
      "if-no-files-found": "warn",
      dependencies: "none",
      paths: [
        {
          on: "success",
          path: "whateverpath"
        }
      ]
    }
  };

  // Act
  const result = treatProject("projectC", buildConfigurationNoDefault);

  // Assert
  expect(expected).toEqual(result.build);
});
