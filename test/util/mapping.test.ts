import * as mappingUtils from "@bc-cr/util/mapping";

describe("getMapping", () => {
  const { getMapping } = mappingUtils;
  test("starting project and current project is the same", () => {
    const projectName = "project";
    const projectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: { default: [] },
    };
    expect(
      getMapping(
        projectName,
        projectMapping,
        projectName,
        projectMapping,
        "main"
      )
    ).toBe(undefined);
  });

  test("mapping for current project is defined in starting project's dependencies", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: {
        default: [],
        projectA: [{ source: "7.x", target: "main" }],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: [],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.x"
      )
    ).toStrictEqual({ source: "7.x", target: "main" });
  });

  test("mapping for current project is not defined in starting project's dependencies. Using default", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: {
        default: [{ source: "7.x", target: "main" }],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: [],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.x"
      )
    ).toStrictEqual({ source: "7.x", target: "main" });
  });

  test("mapping for current project is not defined in starting project's dependencies. Target branch not found in default", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: {
        default: [{ source: "8.x", target: "main" }],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: [],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.x"
      )
    ).toBe(undefined);
  });

  test("current project is excluded in starting project's mappings", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: ["projectA"],
      dependant: { default: [] },
      dependencies: {
        default: [{ source: "7.x", target: "main" }],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: [],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.x"
      )
    ).toBe(undefined);
  });

  test("mapping for starting project is defined in current project's mapping", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: {
        default: [],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: [],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [],
        projectB: [{ source: "7.x", target: "main" }],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.x"
      )
    ).toStrictEqual({ source: "7.x", target: "main" });
  });

  test("mapping for starting project is not defined in current project's mapping. Using default", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: {
        default: [],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: [],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [{ source: "7.x", target: "main" }],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.x"
      )
    ).toStrictEqual({ source: "7.x", target: "main" });
  });

  test("mapping for starting project is not defined in current project's mapping. Target branch not found in default", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: {
        default: [],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: [],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [{ source: "8.x", target: "main" }],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.x"
      )
    ).toBe(undefined);
  });

  test("starting project excluded in current project's mapping", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: {
        default: [],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: ["projectB"],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [{ source: "7.x", target: "main" }],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.x"
      )
    ).toBe(undefined);
  });

  test("target branch matches using regex", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: {
        default: [],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: [],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [{ source: "7\\.\\d+", target: "main" }],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.1"
      )
    ).toStrictEqual({ source: "7\\.\\d+", target: "main" });
  });

  test("target branch does not match using regex", () => {
    const startingProject = "projectB";
    const startingProjectMapping = {
      exclude: [],
      dependant: { default: [] },
      dependencies: {
        default: [],
      },
    };
    const currentProject = "projectA";
    const currentProjectMapping = {
      exclude: [],
      dependencies: {
        default: [],
      },
      dependant: {
        default: [{ source: "7\\.\\d+", target: "main" }],
      },
    };

    expect(
      getMapping(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "8.1"
      )
    ).toBe(undefined);
  });
});

describe("getMappedTarget", () => {
  const { getMappedTarget } = mappingUtils;
  const startingProject = "projectB";
  const startingProjectMapping = {
    exclude: [],
    dependant: { default: [] },
    dependencies: {
      default: [],
      projectA: [{ source: "7.x", target: "main" }],
    },
  };
  const currentProject = "projectA";
  const currentProjectMapping = {
    exclude: [],
    dependencies: {
      default: [],
    },
    dependant: {
      default: [],
    },
  };
  test("found a mapped target", () => {
    jest
      .spyOn(mappingUtils, "getMapping")
      .mockReturnValueOnce({ source: "7.x", target: "main" });
    expect(
      getMappedTarget(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "7.x"
      )
    ).toBe("main");
  });

  test("did not find a mapped target", () => {
    jest
      .spyOn(mappingUtils, "getMapping")
      .mockReturnValueOnce(undefined);
    expect(
      getMappedTarget(
        startingProject,
        startingProjectMapping,
        currentProject,
        currentProjectMapping,
        "branch"
      )
    ).toBe("branch");
  });
});
