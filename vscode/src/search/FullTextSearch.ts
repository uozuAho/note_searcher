export interface FullTextSearch {
  // todo: indexFile is temporary
  indexFile(path: string, text: string, tags: string[]): unknown;
  search: (query: string) => Promise<string[]>;
  onFileModified: (path: string, text: string, tags: string[]) => Promise<void>;
}
