import { Link } from "./LinkIndex";

export interface IMultiIndex {
  // queries
  fullTextSearch: (query: string) => Promise<string[]>;
  filenameToAbsPath(filename: string): string[];
  notes(): IterableIterator<string>;
  containsNote(absPathOrFilename: string): boolean;
  linksFrom(absPath: string): string[];
  linksTo(path: string): string[];
  findAllDeadLinks(): Link[];

  // commands
  indexAllFiles: (dir: string) => Promise<void>;
  onFileModified: (path: string, text: string) => Promise<void>;
  onFileDeleted: (path: string) => Promise<void>;
}
