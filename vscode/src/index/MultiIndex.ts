import { DefaultMultiIndex } from './DefaultMultiIndex';
import { createFileSystem } from '../utils/FileSystem';
import { Link } from "./LinkIndex";

// todo: are all these methods needed?
export interface MultiIndex {
  indexAllFiles: (dir: string) => Promise<void>;
  // todo: rename to full text search
  search: (query: string) => Promise<string[]>;
  addFile: (path: string, text: string, tags: string[]) => unknown;
  onFileModified: (path: string, text: string) => Promise<void>;
  allTags: () => string[];
  notes(): IterableIterator<string>;
  containsNote(absPathOrFilename: string): boolean;
  filenameToAbsPath(filename: string): string[];
  linksFrom(absPath: string): string[];
  linksTo(path: string): string[];
  findAllDeadLinks(): Link[];
}

export const createMultiIndex = () =>
{
  return new DefaultMultiIndex(createFileSystem());
};
