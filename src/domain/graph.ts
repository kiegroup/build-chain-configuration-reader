import { Dependency } from "@bc-cr/domain/dependencies";

export type Graph = {
  [vertex: string]: {
    incoming: Set<string>
    outgoing: Set<string>
    dependency: Dependency
    depth: number
  }
}

/**
 * DFS visit flow: 
 * none -> visting outgoing -> visited outgoing -> visiting incoming -> all
 */
export enum Visited {
  VISITED_ALL,
  VISITING_OUTGOING,
  VISITED_OUTGOING,
  VISITING_INCOMING,
  VISITED_NONE
}
