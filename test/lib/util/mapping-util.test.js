const { getBaseBranch } = require("../../../src/lib/util/mapping-util");

afterEach(() => {
  jest.clearAllMocks();
});

describe("getTargetBranch", () => {
  test("project triggering the job", () => {
    // Arrange
    const projectTriggeringTheJob = "projectA";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectC", "projectD"]
    };
    const currentProject = projectTriggeringTheJob;
    const currentProjectMapping = projectTriggeringTheJobMapping;
    const targetBranch = "branchx";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual(targetBranch);
  });

  test("targetBranch different. No project triggering job mapping", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = undefined;
    const currentProject = "projectA";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      }
    };
    const targetBranch = "branchx";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual(targetBranch);
  });

  test("targetBranch same. No project triggering job mapping", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = undefined;
    const currentProject = "projectA";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      }
    };
    const targetBranch = "main";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("7.x");
  });

  test("targetBranch same. No project triggering job mapping. Project excluded", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectC", "projectD"]
    };
    const currentProject = "projectD";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectB"]
    };
    const targetBranch = "main";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual(targetBranch);
  });

  test("targetBranch same. No project triggering job mapping. Project not excluded", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectC", "projectD"]
    };
    const currentProject = "projectD";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectX"]
    };
    const targetBranch = "main";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("7.x");
  });

  test("targetBranch same. No project triggering job mapping. Project excluded and NO mapping defined", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectC", "projectD"]
    };
    const currentProject = "projectD";
    const currentProjectMapping = undefined;
    const targetBranch = "main";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual(targetBranch);
  });

  test("targetBranch same. No project triggering job mapping. Project excluded and mapping defined", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectC", "projectD"]
    };
    const currentProject = "projectD";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      }
    };
    const targetBranch = "main";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("7.x");
  });

  test("targetBranch same. No project triggering job mapping. Mapping taken from dependencies (NOT from default", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ],
        projectD: [
          {
            source: "7.x",
            target: "8.x"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectC"]
    };
    const currentProject = "projectD";
    const currentProjectMapping = undefined;
    const targetBranch = "7.x";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("8.x");
  });

  test("targetBranch same. No project triggering job mapping. Mapping taken from dependencies (from default)", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectC"]
    };
    const currentProject = "projectD";
    const currentProjectMapping = [
      {
        source: "7.x",
        target: "branchX"
      }
    ];
    const targetBranch = "7.x";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("main");
  });

  test("targetBranch same. Both have mapping. Mapping taken from dependencies (from default)", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      }
    };
    const currentProject = "projectD";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "8.x",
            target: "branchX"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "branchX",
            target: "8.x"
          }
        ]
      }
    };
    const targetBranch = "branchX";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("8.x");
  });

  test("targetBranch same. Both have mapping. Mapping taken from dependencies (from project mapping)", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ],
        projectB: [
          {
            source: "9.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      }
    };
    const currentProject = "projectD";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "8.x",
            target: "branchX"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "branchY",
            target: "8.x"
          }
        ],
        projectB: [
          {
            source: "branchX",
            target: "9.x"
          }
        ]
      }
    };
    const targetBranch = "branchX";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("9.x");
  });

  test("targetBranch same. projectB mapping main", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = undefined;
    const currentProject = "projectA";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ],
        projectB: [
          {
            source: "main",
            target: "main-map"
          },
          {
            source: "main",
            target: "main-map"
          }
        ]
      }
    };
    const targetBranch = "main";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("main-map");
  });

  test("targetBranch same. projectB mapping main", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = undefined;
    const currentProject = "projectA";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ],
        projectB: [
          {
            source: "main",
            target: "main-map"
          },
          {
            source: "main",
            target: "main-map"
          }
        ]
      }
    };
    const targetBranch = "main";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("main-map");
  });

  test("targetBranch same. projectB no matching mapping", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = undefined;
    const currentProject = "projectA";
    const currentProjectMapping = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "mainx",
            target: "7.x.y"
          }
        ],
        projectB: [
          {
            source: "main",
            target: "main-map"
          },
          {
            source: "main",
            target: "main-map"
          }
        ]
      }
    };
    const targetBranch = "mainx";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("7.x.y");
  });

  test("targetBranch same. regex", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "8.x",
            target: "main8.x"
          },
          {
            source: ".*",
            target: "main.*"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectC"]
    };
    const currentProject = "projectD";
    const currentProjectMapping = [
      {
        source: "7.x",
        target: "branchX"
      }
    ];
    const targetBranch = "7.x";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("main.*");
  });

  test("targetBranch same. regex2", () => {
    // Arrange
    const projectTriggeringTheJob = "projectB";
    const projectTriggeringTheJobMapping = {
      dependencies: {
        default: [
          {
            source: "8.x",
            target: "main8.x"
          },
          {
            source: "\\d\\..",
            target: "main.*"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          }
        ]
      },
      exclude: ["projectC"]
    };
    const currentProject = "projectD";
    const currentProjectMapping = [
      {
        source: "7.x",
        target: "branchX"
      }
    ];
    const targetBranch = "7.x";
    // Act
    const result = getBaseBranch(
      projectTriggeringTheJob,
      projectTriggeringTheJobMapping,
      currentProject,
      currentProjectMapping,
      targetBranch
    );
    // Assert
    expect(result).toStrictEqual("main.*");
  });
  describe("exclude", () => {
    const projectTriggeringTheJobMappingExclude = {
      dependencies: {
        default: [
          {
            source: "7.x",
            target: "main",
            exclude: "projectB"
          }
        ],
        projectB: [
          {
            source: "8.x",
            target: "main"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "main",
            target: "7.x"
          },
          {
            source: "8.x",
            target: "9.x"
          }
        ]
      }
    };

    const currentProjectMappingExclude = {
      dependencies: {
        default: [
          {
            source: "8.x",
            target: "branchX"
          }
        ]
      },
      dependant: {
        default: [
          {
            source: "branchY",
            target: "8.x"
          }
        ],
        projectB: [
          {
            source: "branchX",
            target: "9.x"
          }
        ]
      }
    };

    test("dependency default exclude. matching branch", () => {
      // Arrange
      const projectTriggeringTheJob = "projectA";
      const currentProject = "projectB";
      const targetBranch = "7.x";
      // Act
      const result = getBaseBranch(
        projectTriggeringTheJob,
        projectTriggeringTheJobMappingExclude,
        currentProject,
        currentProjectMappingExclude,
        targetBranch
      );
      // Assert
      expect(result).toStrictEqual("7.x");
    });

    test("dependency default exclude. not matching branch", () => {
      // Arrange
      const projectTriggeringTheJob = "projectA";
      const currentProject = "projectB";
      const targetBranch = "8.x";
      // Act
      const result = getBaseBranch(
        projectTriggeringTheJob,
        projectTriggeringTheJobMappingExclude,
        currentProject,
        currentProjectMappingExclude,
        targetBranch
      );
      // Assert
      expect(result).toStrictEqual("main");
    });
  });
});
