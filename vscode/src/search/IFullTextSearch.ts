export interface IFullTextSearch {
  search: (query: string) => Promise<string[]>;
  addFile(path: string, text: string): unknown;
  onFileModified: (path: string, text: string) => Promise<void>;
  onFileDeleted: (path: string) => Promise<void>;
}
