import { NoteSearcherConfigProvider } from '../note_searcher/NoteSearcherConfigProvider';
import { LunrMultiIndex } from './lunrMultiIndex';
import { createFileSystem } from '../utils/FileSystem';
import { FullTextSearch } from '../search/FullTextSearch';
import { TagsIndex } from './TagsIndex';
import { NoteLinkIndex } from "./NoteLinkIndex";

export type MultiIndex = FileSystemIndexer & FullTextSearch & TagsIndex & NoteLinkIndex;

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
