import { Mapping } from "@bc-cr/domain/mapping";

export interface Dependency {
  project: string;
  clone?: string[];
  dependencies?: {
    project: string
  }[];
  mapping?: Mapping
}
