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
    map[dependency.project] = constructNode(dependency, defaultBuild, build);
    return map;
  }, {});

  return dependencies.reduce((roots: Node[], dependency) => {
    if (isRoot(dependency)) {
      // is dependency does not have any parents then it is a root and
      // store it in the roots array
      roots.push(map[dependency.project]);
    } else {
      dependency.dependencies?.forEach(parentDependency => {
        // make sure the parent project has been defined
        if (!map[parentDependency.project]) {
          throw new Error(
            `The project ${parentDependency.project} does not exist on project list. Please review your project definition file`
          );
        }

        // add current dependency as child of the parentDependency
        map[parentDependency.project].children.push(map[dependency.project]);

        // store a reference of the parent in the child as well
        // using a string instead of Node to avoid circular dependency
        map[dependency.project].parents.push(map[parentDependency.project]);
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
) {
  const buildCommand = getBuildCommand(dependency.project, defaultBuild, build);
  const clone = getClone(dependency.project, build);
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
    ...(clone ? {clone} : {})
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
  const projectBuild = build?.find(b => b.project === project);
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

function getClone(project: string, build?: Build[]) {
  return build?.find(b => b.project === project)?.clone;
}
