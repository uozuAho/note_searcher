export interface FullTextSearch {
  search: (query: string) => Promise<string[]>;
}
