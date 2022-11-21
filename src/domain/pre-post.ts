export type Pre = string[];
export type Post = {
  success?: string[],
  failure?: string[],
  always?: string[],
};