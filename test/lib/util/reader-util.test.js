const {
  treatUrl,
  treatMapping,
  executeUrlExpressions
} = require("../../../src/lib/util/reader-util");
const { logger } = require("../../../src/lib/common");
jest.mock("../../../src/lib/common");

test("executeUrlExpressions without expressions", () => {
  // Arrange
  const string =
    "https://raw.githubusercontent.com/kiegroup/droolsjbpm-build-bootstrap/main/.ci/pull-request-config.yaml";

  // Act
  const result = executeUrlExpressions(string);

  // Assert
  expect(result).toBe(string);
});

test("executeUrlExpressions with 1 expression", () => {
  // Arrange
  process.env = Object.assign(process.env, {
    GITHUB_BASE_REF: "1.2.3"
  });
  const string =
    "https://raw.githubusercontent.com/kiegroup/droolsjbpm-build-bootstrap/%{process.env.GITHUB_BASE_REF.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1+7}.${n2}.${n3}`)}/.ci/pull-request-config.yml";

  // Act
  const result = executeUrlExpressions(string);

  // Assert
  expect(result).toBe(
    "https://raw.githubusercontent.com/kiegroup/droolsjbpm-build-bootstrap/8.2.3/.ci/pull-request-config.yml"
  );
});

test("executeUrlExpressions with 2 expressions", () => {
  // Arrange
  process.env = Object.assign(process.env, {
    GITHUB_BASE_REF: "1.2.3"
  });
  const string =
    "https://raw.githubusercontent.com/%{process.env.GITHUB_BASE_REF.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1-1}.${+n2+2}.${+n3+3}`)}/droolsjbpm-build-bootstrap/%{process.env.GITHUB_BASE_REF.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1+7}.${n2}.${n3}`)}/.ci/pull-request-config.yml";

  // Act
  const result = executeUrlExpressions(string);

  // Assert
  expect(result).toBe(
    "https://raw.githubusercontent.com/0.4.6/droolsjbpm-build-bootstrap/8.2.3/.ci/pull-request-config.yml"
  );
});

test("treatUrl", () => {
  // Arrange
  const string = "1${TWO}${THREE}4567${EIGHT}";

  // Act
  const result = treatUrl(string, { TWO: 2, THREE: 3, EIGHT: 8 });

  // Assert
  expect(result).toBe("12345678");
});

test("treatUrl missing placeholders", () => {
  // Arrange
  const string = "1${TWO}${THREE}4567${EIGHT}";

  // Act
  const result = treatUrl(string, { TWO: 2, EIGHT: 8 });

  // Assert
  expect(result).toBe("12${THREE}45678");
});

test("treatMapping no expression", () => {
  // Arrange
  const mapping = {
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

  // Act
  treatMapping(mapping);

  // Assert
  expect(mapping).toBe(mapping);
});

test("treatUrl with expression", () => {
  // Arrange
  const string = "1${TWO}${THREE}45%{+20+50}67${EIGHT}";

  // Act
  const result = treatUrl(string, { TWO: 2, THREE: 3, EIGHT: 8 });

  // Assert
  expect(result).toBe("1234570678");
});

test("treatUrl with expression", () => {
  // Arrange
  const string = "1${TWO}${THREE}45%{'text'}67${EIGHT}";

  // Act
  const result = treatUrl(string, { TWO: 2, THREE: 3, EIGHT: 8 });

  // Assert
  expect(result).toBe("12345text678");
});

test("treatMapping with simple expression on dependencies", () => {
  // Arrange
  const mapping = {
    dependencies: {
      default: [
        {
          source: "7.x",
          targetExpression: "2+2"
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
  const expecteResult = {
    dependencies: {
      default: [
        {
          source: "7.x",
          target: 4,
          targetExpression: "2+2"
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

  // Act
  treatMapping(mapping);

  // Assert
  expect(mapping).toStrictEqual(expecteResult);
});

test("treatMapping with string expression on dependencies", () => {
  // Arrange
  const mapping = {
    dependencies: {
      default: [
        {
          source: "7.x",
          targetExpression: "`${mapping.source}.y`"
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
  const expecteResult = {
    dependencies: {
      default: [
        {
          source: "7.x",
          target: "7.x.y",
          targetExpression: "`${mapping.source}.y`"
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

  // Act
  treatMapping(mapping);

  // Assert
  expect(mapping).toStrictEqual(expecteResult);
});

test("treatMapping with string expression on dependencies", () => {
  // Arrange
  process.env.SOURCE_BRANCH = "1.x.y";
  const mapping = {
    dependencies: {
      default: [
        {
          targetExpression:
            "process.env.SOURCE_BRANCH.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1+8}.${n2}.${n3}`)"
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
  const expecteResult = {
    dependencies: {
      default: [
        {
          target: "9.x.y",
          targetExpression:
            "process.env.SOURCE_BRANCH.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1+8}.${n2}.${n3}`)"
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

  // Act
  treatMapping(mapping);

  // Assert
  expect(mapping).toStrictEqual(expecteResult);
});

test("treatMapping with simple expression on dependant", () => {
  // Arrange
  const mapping = {
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
          targetExpression: "2+2"
        }
      ]
    }
  };
  const expecteResult = {
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
          target: 4,
          targetExpression: "2+2"
        }
      ]
    }
  };

  // Act
  treatMapping(mapping);

  // Assert
  expect(mapping).toStrictEqual(expecteResult);
});

test("treatMapping with simple expression on dependant and dependencies", () => {
  // Arrange
  const mapping = {
    dependencies: {
      default: [
        {
          source: "7.x",
          targetExpression: "2+3"
        }
      ]
    },
    dependant: {
      default: [
        {
          source: "main",
          targetExpression: "2+2"
        }
      ]
    }
  };
  const expecteResult = {
    dependencies: {
      default: [
        {
          source: "7.x",
          target: 5,
          targetExpression: "2+3"
        }
      ]
    },
    dependant: {
      default: [
        {
          source: "main",
          target: 4,
          targetExpression: "2+2"
        }
      ]
    }
  };

  // Act
  treatMapping(mapping);

  // Assert
  expect(mapping).toStrictEqual(expecteResult);
});

test("treatMapping with error expression on dependencies", () => {
  // Arrange
  const mapping = {
    dependencies: {
      default: [
        {
          source: "7.x",
          targetExpression: "throw new Error('amazing error')"
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
  const expecteResult = {
    dependencies: {
      default: [
        {
          source: "7.x",
          target: undefined,
          targetExpression: "throw new Error('amazing error')"
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

  // Act
  treatMapping(mapping);

  // Assert
  expect(mapping).toStrictEqual(expecteResult);
  expect(logger.error).toBeCalled();
});
