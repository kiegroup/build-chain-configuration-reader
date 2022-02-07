const { logger } = require("../common");

function getBaseBranch(
  projectTriggeringTheJob,
  projectTriggeringTheJobMapping,
  currentProject,
  currentProjectMapping,
  expectedBaseBranch
) {
  // If the current project it the project triggering the job there's no mapping

  if (currentProject !== projectTriggeringTheJob) {
    // If the current project has been excluded from the mapping, there's no mapping
    if (
      projectTriggeringTheJobMapping &&
      (projectTriggeringTheJobMapping.exclude
        ? !projectTriggeringTheJobMapping.exclude.includes(currentProject)
        : true)
    ) {
      // The mapping is either taken from the project mapping or from the default one
      const mapping =
        getMappingInfo(
          currentProject,
          projectTriggeringTheJobMapping.dependencies[currentProject],
          expectedBaseBranch
        ) ||
        getMappingInfo(
          currentProject,
          projectTriggeringTheJobMapping.dependencies.default,
          expectedBaseBranch
        );
      if (mapping) {
        return mapping.target;
      }
      // If the current project has a mapping and the source matched with the targetBranch then this mapping is taken
    }
    if (
      currentProjectMapping &&
      currentProjectMapping.dependant &&
      (currentProjectMapping.exclude
        ? !currentProjectMapping.exclude.includes(projectTriggeringTheJob)
        : true)
    ) {
      const mapping =
        getMappingInfo(
          currentProject,
          currentProjectMapping.dependant[projectTriggeringTheJob],
          expectedBaseBranch
        ) ||
        getMappingInfo(
          currentProject,
          currentProjectMapping.dependant.default,
          expectedBaseBranch
        );
      if (mapping) {
        return mapping.target;
      }
    }
  }
  return expectedBaseBranch;
}

function getMappingInfo(currentProject, mapping, sourceBranch) {
  const excludeFilter = (exclude, project) =>
    [null, undefined, []].includes(exclude) || !exclude.includes(project);
  if (mapping) {
    // The exact match has precedence over the regex
    const foundMappingEqual = mapping
      .filter(e => excludeFilter(e.exclude, currentProject))
      .filter(e => e.source === sourceBranch);
    const foundMappingRegex = mapping
      .filter(e => excludeFilter(e.exclude, currentProject))
      .filter(e => sourceBranch.match(new RegExp(`^${e.source}$`)));
    const foundMapping =
      foundMappingEqual && foundMappingEqual.length
        ? foundMappingEqual
        : foundMappingRegex;
    if (foundMapping.length) {
      const found = foundMapping[0];
      if (foundMapping.length > 1) {
        logger.warn(
          `The mapping for ${currentProject} has a duplication for source branch ${sourceBranch}. First matching ${found.target} will be used.`
        );
      }
      return found;
    }
  }
  return undefined;
}

module.exports = {
  getBaseBranch
};
