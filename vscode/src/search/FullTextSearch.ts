import * as path from 'path';

import { LuceneCli } from './LuceneCli';

export interface FullTextSearch {
  search: (query: string) => Promise<string[]>;
  index: (dir: string) => Promise<void>;
}

/**
 * @param extensionDir location of this vscode extension's directory
 */
export const createFullTextSearch = (extensionDir: string): FullTextSearch => {
  const jarPath = path.join(extensionDir, 'dist/note_searcher.jar');
  return new LuceneCli(jarPath);
};


