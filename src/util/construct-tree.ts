import { Dependency } from "@bc-cr/domain/dependencies";
import { Build, BuildCommand, CommandLevel } from "@bc-cr/domain/build";
import { Node } from "@bc-cr/domain/node";

export function constructTree(
  dependencies: Dependency[],
  defaultBuild?: BuildCommand,
  build?: Build[]
): Node[] {
  // construct a map where key is the project name and value is the constructed node
  // we are using a map for faster lookup
  const map = dependencies.reduce((map: Record<string, Node>, dependency) => {
    const node = constructNode(dependency, defaultBuild, build);
    if (node) {
      map[dependency.project] = node;
    }
    return map;
  }, {});

  return dependencies.reduce((roots: Node[], dependency) => {
    // if dependency does not have any parents then it is a root and
    // it is not skipped if the it is not undefined in the map
    if (isRoot(dependency) && map[dependency.project]) {
      roots.push(map[dependency.project]);
    } else {
      const parentDependencies = dependency.dependencies?.map(d => d.project) ?? [];
      parentDependencies.forEach(parentDependency => {
        // make sure the parent project has been defined
        if (!map[parentDependency]) {
          throw new Error(
            `The project ${parentDependency} does not exist on project list. Please review your project definition file`
          );
        }

        // add only if it was not skipped
        if (
          map[dependency.project] &&
          !reachableThroughOtherParents(dependencies, parentDependencies, parentDependency)
        ) {
          // add current dependency as child of the parentDependency
          map[parentDependency].children.push(map[dependency.project]);

          // store a reference of the parent in the child as well
          // using a string instead of Node to avoid circular dependency
          map[dependency.project].parents.push(map[parentDependency]);
        }
      });
    }
    // roots array contains nodes which don't have any parents
    // and are the "starting" point in the tree
    return roots;
  }, []);
}

function constructNode(
  dependency: Dependency,
  defaultBuild?: BuildCommand,
  build?: Build[]
): Node | undefined {
  const buildConfig = findBuildConfigForProject(dependency.project, build);
  const clone = buildConfig?.clone;
  const buildCommand = !buildConfig?.skip ? getBuildCommand(dependency.project, defaultBuild, build) : undefined;
  return {
    project: dependency.project,
    parents: [],
    children: [],
    archiveArtifacts: getArchiveArtifacts(dependency.project, build),
    mapping: dependency.mapping,
    before: buildCommand?.before,
    after: buildCommand?.after,
    commands: {
      upstream: buildCommand?.upstream ?? [],
      downstream: buildCommand?.downstream ?? [],
      current: buildCommand?.current ?? [],
    },
    ...(clone ? { clone } : {}),
  };
}

function isRoot(dependency: Dependency): boolean {
  return !dependency.dependencies || dependency.dependencies.length === 0;
}

function getArchiveArtifacts(project: string, builds?: Build[]) {
  return builds?.find(build => build.project === project)?.[
    "archive-artifacts"
  ];
}

/**
 * Given a project get the build commands for it. It uses the
 * default build config to fill out any missing commands
 * @param project
 * @param defaultBuild
 * @param build
 * @returns
 */
function getBuildCommand(
  project: string,
  defaultBuild?: BuildCommand,
  build?: Build[]
): BuildCommand | undefined {
  const projectBuild = findBuildConfigForProject(project, build);
  const buildCommand = projectBuild?.["build-command"];
  if (!buildCommand) {
    return defaultBuild;
  }

  return {
    ...buildCommand,
    after: buildCommand?.after
      ? getDefaultCommandLevel(buildCommand.after, defaultBuild?.after)
      : defaultBuild?.after,
    before: buildCommand?.before
      ? getDefaultCommandLevel(buildCommand.before, defaultBuild?.before)
      : defaultBuild?.before,
    ...getDefaultCommandLevel(
      {
        current: buildCommand.current,
        upstream: buildCommand.upstream,
        downstream: buildCommand.downstream,
      },
      defaultBuild
    ),
  };
}

/**
 * Update the given commands for upstream, downstream and current with the default ones
 * in case they are missing
 * @param commandLevel
 * @param defaultcommandLevel
 * @returns
 */
function getDefaultCommandLevel(
  commandLevel: CommandLevel,
  defaultcommandLevel?: CommandLevel
) {
  if (!defaultcommandLevel) {
    return commandLevel;
  }

  const commandLevelClone = { ...commandLevel };

  Object.entries(commandLevel).forEach(([key, val]) => {
    if (val.length === 0) {
      commandLevelClone[key as keyof CommandLevel] =
        defaultcommandLevel[key as keyof CommandLevel] ?? val;
    }
  });

  return commandLevelClone;
}

function findBuildConfigForProject(project: string, build?: Build[]) {
  return build?.find(b => b.project === project);
}

function reachableThroughOtherParents(dependencies: Dependency[], allParents: string[], parentToBeAdded: string) {
  for (const parent of allParents) {
    const grandparents = dependencies.find(d => d.project === parent)?.dependencies?.map(d => d.project);
    if (
      grandparents?.includes(parentToBeAdded) || 
      reachableThroughOtherParents(dependencies, grandparents ?? [], parentToBeAdded)
    ) {
      return true;
    }
  }
  return false;
}