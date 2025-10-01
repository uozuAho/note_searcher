import { DefaultMultiIndex } from './DefaultMultiIndex';
import { createNodeFileSystem } from '../utils/NodeFileSystem';
import { Link } from "./LinkIndex";

export interface IMultiIndex {
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
  return new DefaultMultiIndex(createNodeFileSystem(), workspaceDir);
};
