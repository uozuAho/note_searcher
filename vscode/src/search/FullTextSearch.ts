export interface FullTextSearch {
  search: (query: string) => Promise<string[]>;
  // onFileModified: (path: string, text: string, tags: string[]) => Promise<void>;
}
