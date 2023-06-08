import { Build, BuildCommand, CommandLevel } from "@bc-cr/domain/build";
import { Dependency } from "@bc-cr/domain/dependencies";
import { Node } from "@bc-cr/domain/node";

export function constructNode(
  dependency: Dependency,
  defaultBuild?: BuildCommand,
  build?: Build[],
  depth = 0
): Node {
  const buildConfig = findBuildConfigForProject(dependency.project, build);
  const clone = buildConfig?.clone;
  const buildCommand = !buildConfig?.skip ? getBuildCommand(dependency.project, defaultBuild, build) : undefined;
  return {
    project: dependency.project,
    parents: [], // adding this for backward compatability but we dont need this
    children: [], // adding this for backward compatability but we dont need this
    archiveArtifacts: getArchiveArtifacts(dependency.project, build),
    mapping: dependency.mapping,
    before: buildCommand?.before,
    after: buildCommand?.after,
    depth,
    commands: {
      upstream: buildCommand?.upstream ?? [],
      downstream: buildCommand?.downstream ?? [],
      current: buildCommand?.current ?? [],
    },
    ...(clone ? { clone } : {}),
    platformId: dependency.platform
  };
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