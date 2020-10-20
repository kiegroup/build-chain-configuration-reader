function getBuild(project, buildConfiguration) {
  const build = buildConfiguration.build
    ? overrideProperties(
        buildConfiguration.default,
        buildConfiguration.build.find(
          projectBuild => project === projectBuild.project
        )
      )
    : buildConfiguration.default;
  delete build.project;
  return manipulateArchiveArtifacts(manipulateProperties(build), project);
}

/**
 * Override properties from one object to another
 *
 * @param {Object} target
 * @param {Object} source
 */
function overrideProperties(target, source) {
  const targetClone = { ...target };
  const sourceClone = { ...source };
  Object.entries(targetClone)
    .filter(([key]) => sourceClone[key])
    .forEach(([key, value]) => {
      if (typeof value === "object") {
        targetClone[key] = overrideProperties(
          targetClone[key],
          sourceClone[key]
        );
      } else {
        targetClone[key] = sourceClone[key];
      }
    });

  Object.keys(sourceClone)
    .filter(key => !targetClone[key])
    .forEach(key => (targetClone[key] = sourceClone[key]));
  return targetClone;
}

/**
 * manipulates certains properties from an object. It basically converts String lists to Arrays
 * @param {Object} properties the properties to manipulate
 */
function manipulateProperties(properties) {
  const propertiesClone = { ...properties };
  Object.entries(propertiesClone).forEach(([key, value]) => {
    if (typeof value === "object" && !Array.isArray(value)) {
      propertiesClone[key] = manipulateProperties(propertiesClone[key]);
    } else {
      propertiesClone[key] = value.includes("\n")
        ? value.split("\n").filter(e => e)
        : value;
    }
  });
  return propertiesClone;
}

/**
 * manipulates `archive-artifacts` properties
 * @param {Object} build the node's build section
 * @param {String} project the project name
 */
function manipulateArchiveArtifacts(build, project) {
  const archiveArtifacts = build["archive-artifacts"];
  if (archiveArtifacts) {
    archiveArtifacts["if-no-files-found"] = build["archive-artifacts"][
      "if-no-files-found"
    ]
      ? archiveArtifacts["if-no-files-found"]
      : "warn";
    archiveArtifacts.dependencies = archiveArtifacts.dependencies
      ? archiveArtifacts.dependencies
      : "none";
    archiveArtifacts.name = archiveArtifacts.name
      ? archiveArtifacts.name
      : project;
    archiveArtifacts.paths = treatArchiveArtifactsPath(archiveArtifacts.path);
  }
  return build;
}

function treatArchiveArtifactsPath(archiveArtifactsPath) {
  return (Array.isArray(archiveArtifactsPath)
    ? archiveArtifactsPath
    : archiveArtifactsPath.split("\n")
  )
    .filter(line => line)
    .reduce((acc, pathExpression) => {
      acc.push(convertPathExpressionToPath(pathExpression));
      return acc;
    }, []);
}

function convertPathExpressionToPath(pathExpression) {
  const match = pathExpression.match(/([^@]*)@?(always|success|failure)?/);
  return match
    ? {
        path: match[1],
        on: match[2] ? match[2] : "success"
      }
    : pathExpression;
}

function treatProject(project, buildConfiguration) {
  return { build: getBuild(project, buildConfiguration) };
}

module.exports = { treatProject };
