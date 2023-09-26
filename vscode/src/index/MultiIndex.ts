import { DefaultMultiIndex } from './DefaultMultiIndex';
import { createFileSystem } from '../utils/FileSystem';
import { Link } from "./LinkIndex";

export interface MultiIndex {
  // queries
  fullTextSearch: (query: string) => Promise<string[]>;
  allTags: () => string[];
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

export const createMultiIndex = (workspaceDir: string) =>
{
  return new DefaultMultiIndex(createFileSystem(), workspaceDir);
};
