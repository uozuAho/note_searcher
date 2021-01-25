import { LunrMultiIndex } from './lunrMultiIndex';
import { createFileSystem } from '../utils/FileSystem';
import { FullTextSearch } from '../search/FullTextSearch';
import { TagIndex } from './TagIndex';
import { LinkIndex } from "./LinkIndex";
import { NoteIndex } from "./NoteIndex";

export type MultiIndex =
  FileSystemIndexer
  & FullTextSearch
  & TagIndex
  & NoteIndex
  & LinkIndex;

interface FileSystemIndexer {
  index: (dir: string) => Promise<void>;
}

/**
 * @param extensionDir location of this vscode extension's directory
 */
export const createMultiIndex = (): MultiIndex =>
{
  return new LunrMultiIndex(createFileSystem());
};
