import { NoteSearcherConfigProvider } from '../note_searcher/NoteSearcherConfigProvider';
import { LunrNoteIndex } from './lunrNoteIndex';
import { createFileSystem } from '../utils/FileSystem';
import { FullTextSearch } from '../search/FullTextSearch';
import { TagsIndex } from './TagsIndex';
import { NoteLinkIndex } from "./NoteLinkIndex";

export type NoteIndex = FileSystemIndexer & FullTextSearch & TagsIndex & NoteLinkIndex;

interface FileSystemIndexer {
  index: (dir: string) => Promise<void>;
}

/**
 * @param extensionDir location of this vscode extension's directory
 */
export const createNoteIndex = (
  extensionDir: string,
  config: NoteSearcherConfigProvider
): NoteIndex =>
{
  return new LunrNoteIndex(createFileSystem());
};
