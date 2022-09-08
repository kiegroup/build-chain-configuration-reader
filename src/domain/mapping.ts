export type Mapping = {
  source: string;
  target: string;
  targetExpression?: string;
};

export type Dependencies = { default: Mapping[] } & {
  [key: string]: Mapping[];
};

export type Dependant = Dependencies;

export type Mappings = {
  exclude: string[];
  dependencies: Dependencies
  dependant: Dependant
};
