export interface SourceToTarget {
  source: string,
  target?: string,
  targetExpression?: string
}

export interface Depend {
  default: SourceToTarget[],
  [project: string]: SourceToTarget[]
}

export interface Mapping {
  dependencies?: Depend,
  dependant?: Depend,
  exclude: string[]
}
