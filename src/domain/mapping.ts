export type Dependency = {
  source: string;
  target?: string;
  targetExpression?: string;
};

export type Mapping = {
  exclude?: string[];
  dependencies?: {
    [key: string]: Dependency[];
  };
  dependant?: {
    [key: string]: Dependency[];
  };
};
