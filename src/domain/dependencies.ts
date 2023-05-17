import { Mapping } from "@bc-cr/domain/mapping";

export interface Dependency {
  project: string;
  dependencies?: {
    project: string;
  }[];
  mapping?: Mapping;
  platform?: string
}