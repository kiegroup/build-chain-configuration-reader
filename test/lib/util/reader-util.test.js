const { treatUrl, treatMapping } = require("../../../src/lib/util/reader-util");
global.console = {error: jest.fn()}

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
      default: {
        source: "7.x",
        target: "master"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: "7.x"
      }
    }
  };

  // Act
  treatMapping(mapping);

  // Assert
  expect(mapping).toBe(mapping);
});

test("treatMapping with simple expression on dependencies", () => {
  // Arrange
  const mapping = {
    dependencies: {
      default: {
        source: "7.x",
        targetExpression: "2+2"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: "7.x"
      }
    }
  };
  const expecteResult = {
    dependencies: {
      default: {
        source: "7.x",
        target: 4,
        targetExpression: "2+2"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: "7.x"
      }
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
      default: {
        source: "7.x",
        targetExpression: "`${mapping.source}.y`"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: "7.x"
      }
    }
  };
  const expecteResult = {
    dependencies: {
      default: {
        source: "7.x",
        target: "7.x.y",
        targetExpression: "`${mapping.source}.y`"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: "7.x"
      }
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
      default: {
        targetExpression:
          "process.env.SOURCE_BRANCH.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1+8}.${n2}.${n3}`)"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: "7.x"
      }
    }
  };
  const expecteResult = {
    dependencies: {
      default: {
        target: "9.x.y",
        targetExpression:
          "process.env.SOURCE_BRANCH.replace(/(\\d*)\\.(.*)\\.(.*)/g, (m, n1, n2, n3) => `${+n1+8}.${n2}.${n3}`)"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: "7.x"
      }
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
      default: {
        source: "7.x",
        target: "master"
      }
    },
    dependant: {
      default: {
        source: "master",
        targetExpression: "2+2"
      }
    }
  };
  const expecteResult = {
    dependencies: {
      default: {
        source: "7.x",
        target: "master"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: 4,
        targetExpression: "2+2"
      }
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
      default: {
        source: "7.x",
        targetExpression: "2+3"
      }
    },
    dependant: {
      default: {
        source: "master",
        targetExpression: "2+2"
      }
    }
  };
  const expecteResult = {
    dependencies: {
      default: {
        source: "7.x",
        target: 5,
        targetExpression: "2+3"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: 4,
        targetExpression: "2+2"
      }
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
      default: {
        source: "7.x",
        targetExpression: "throw new Error('amazing error')"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: "7.x"
      }
    }
  };
  const expecteResult = {
    dependencies: {
      default: {
        source: "7.x",
        target: undefined,
        targetExpression: "throw new Error('amazing error')"
      }
    },
    dependant: {
      default: {
        source: "master",
        target: "7.x"
      }
    }
  };

  // Act
  treatMapping(mapping);

  // Assert
  expect(mapping).toStrictEqual(expecteResult);
  expect(console.error).toBeCalled()
});
