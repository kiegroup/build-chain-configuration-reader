const { treatUrl } = require("../../../src/lib/util/reader-util");

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
