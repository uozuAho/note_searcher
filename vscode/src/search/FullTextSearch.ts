export interface FullTextSearch {
  search: (query: string) => Promise<string[]>;
  addFile(path: string, text: string, tags: string[]): unknown;
  onFileModified: (path: string, text: string, tags: string[]) => Promise<void>;
  onFileDeleted: (path: string) => Promise<void>;
}
