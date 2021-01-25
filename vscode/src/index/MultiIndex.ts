import { NoteSearcherConfigProvider } from '../note_searcher/NoteSearcherConfigProvider';
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
export const createMultiIndex = (
  extensionDir: string,
  config: NoteSearcherConfigProvider
): MultiIndex =>
{
  return new LunrMultiIndex(createFileSystem());
};
