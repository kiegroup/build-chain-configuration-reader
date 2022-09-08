import {
  Dependant,
  Dependencies,
  Mapping,
  Mappings,
} from "@bc-cr/domain/mapping";

/**
 * Given a target branch (i.e. base branch in a PR), it returns the branch name 
 * that is mapped for the given starting project, current project and target branch
 * The target branch acts as the source in the Mapping domain object. If there is source
 * which is the same as the target branch, then it returns the target of that source.
 * If no mapping is found it returns the target branch itself.
 * @param startingProject 
 * @param startingProjectMappings 
 * @param currentProject 
 * @param currentProjectMappings 
 * @param targetBranch
 * @returns
 */
export function getMappedTarget(
  startingProject: string,
  startingProjectMappings: Mappings,
  currentProject: string,
  currentProjectMappings: Mappings,
  targetBranch: string
): string | undefined {
  return (
    getMapping(
      startingProject,
      startingProjectMappings,
      currentProject,
      currentProjectMappings,
      targetBranch
    )?.target ?? targetBranch
  );
}

/**
 * Returns the mapping for the given starting project, current project and target branch.
 * Finds the mapping in the following order:
 * 1. starting project's dependencies[current project]
 * 2. starting project's dependencies[default]
 * 3. current project's dependant[starting project]
 * 4. current project's dependant[default]
 * 
 * returns undefined if starting and current project are the same or no mapping was found or
 * a project was excluded in the other project's mapping
 * @param startingProject
 * @param startingProjectMappings
 * @param currentProject
 * @param currentProjectMappings
 * @param targetBranch
 * @returns
 */
export function getMapping(
  startingProject: string,
  startingProjectMappings: Mappings,
  currentProject: string,
  currentProjectMappings: Mappings,
  targetBranch: string
): Mapping | undefined {
  if (startingProject === currentProject) {
    return;
  }
  // get mapping from starting project's mapping
  const mappingFromStartingProject = getMappingFromProjectOrDefault(
    targetBranch,
    startingProjectMappings.dependencies,
    currentProject,
    startingProjectMappings.exclude
  );

  if (mappingFromStartingProject) {
    return mappingFromStartingProject;
  }

  // if no mapping from starting project's mapping is found, try current project's mapping
  const mappingFromCurrentProject = getMappingFromProjectOrDefault(
    targetBranch,
    currentProjectMappings.dependant,
    startingProject,
    currentProjectMappings.exclude
  );

  return mappingFromCurrentProject;
}

/**
 * Checks whether given project is excluded or not. If not excluded, finds the mapping either in the default field
 * or in the project's field
 * @param targetBranch
 * @param depend
 * @param project
 * @param exclude
 * @returns
 */
function getMappingFromProjectOrDefault(
  targetBranch: string,
  depend: Dependencies | Dependant,
  project: string,
  exclude: string[]
) {
  if (!exclude.includes(project)) {
    return (
      findMapping(targetBranch, depend[project]) ??
      findMapping(targetBranch, depend.default)
    );
  }
}

/**
 * Finds the mapping for the given branch.
 * Checks if there is a source which exactly matches branch. If not found
 * then checks if the branch matches a source when taken as a regex
 * @param branch
 * @param mappings
 * @returns
 */
function findMapping(
  branch: string,
  mappings?: Mapping[]
): Mapping | undefined {
  return (
    mappings?.find(mapping => mapping.source === branch) ??
    mappings?.find(
      mapping => !!branch.match(new RegExp(`^${mapping.source}$`))
    )
  );
}
