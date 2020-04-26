import * as path from 'path';

import { LuceneCliSearch } from './LuceneCliSearch';
import { NoteSearcherConfigProvider } from '../note_searcher/NoteSearcherConfigProvider';
import { LunrSearch } from './lunrSearch';
import { createFileSystem } from '../utils/FileSystem';

export interface FullTextSearch {
  search: (query: string) => Promise<string[]>;
  index: (dir: string) => Promise<void>;
}

/**
 * @param extensionDir location of this vscode extension's directory
 */
export const createFullTextSearch = (
  extensionDir: string,
  config: NoteSearcherConfigProvider
): FullTextSearch =>
{
  if (config.getConfig().search.useLucene) {
    const jarPath = path.join(extensionDir, 'dist/note_searcher.jar');
    return new LuceneCliSearch(jarPath);
  } else {
    return new LunrSearch(createFileSystem());
  }
};
