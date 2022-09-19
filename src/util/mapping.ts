import { Depend, SourceToTarget, Mapping } from "@bc-cr/domain/mapping";

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
  startingProjectMappings: Mapping,
  currentProject: string,
  currentProjectMappings: Mapping,
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
  startingProjectMappings: Mapping,
  currentProject: string,
  currentProjectMappings: Mapping,
  targetBranch: string
): SourceToTarget | undefined {
  if (startingProject === currentProject) {
    return;
  }
  // get mapping from starting project's mapping
  const mappingFromStartingProject = getSourceToTargetFromProjectOrDefault(
    targetBranch,
    currentProject,
    startingProjectMappings.exclude,
    startingProjectMappings.dependencies
  );

  if (mappingFromStartingProject) {
    return mappingFromStartingProject;
  }

  // if no mapping from starting project's mapping is found, try current project's mapping
  const mappingFromCurrentProject = getSourceToTargetFromProjectOrDefault(
    targetBranch,
    startingProject,
    currentProjectMappings.exclude,
    currentProjectMappings.dependant
  );

  return mappingFromCurrentProject;
}

/**
 * Checks whether given project is excluded or not. If not excluded, finds the source to target map 
 * either in the default field or in the project's field
 * @param targetBranch
 * @param depend
 * @param project
 * @param exclude
 * @returns
 */
function getSourceToTargetFromProjectOrDefault(
  targetBranch: string,
  project: string,
  exclude: string[],
  depend?: Depend
) {
  if (!exclude.includes(project) && depend) {
    return (
      findSourceToTarget(targetBranch, depend[project]) ??
      findSourceToTarget(targetBranch, depend.default)
    );
  }
}

/**
 * Finds the source to target map for the given branch.
 * Checks if there is a source which exactly matches branch. If not found
 * then checks if the branch matches a source when taken as a regex
 * @param branch
 * @param sourceToTarget
 * @returns
 */
function findSourceToTarget(
  branch: string,
  sourceToTarget?: SourceToTarget[]
): SourceToTarget | undefined {
  return (
    sourceToTarget?.find(stt => stt.source === branch) ??
    sourceToTarget?.find(
      stt => !!branch.match(new RegExp(`^${stt.source}$`))
    )
  );
}
