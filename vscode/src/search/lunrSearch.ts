import * as lunr from 'lunr';

import { FullTextSearch } from "./FullTextSearch";
import { FileSystem } from "../utils/FileSystem";

export class LunrSearch implements FullTextSearch {
  private _index: lunr.Index | null = null;

  constructor(private fileSystem: FileSystem) {}

  public search = (query: string) => {
    if (!this._index) { return Promise.resolve([]); }

    return Promise.resolve(this._index.search(query).map(r => r.ref));
  }

  public index = (dir: string) => {
    this._index = lunr(builder => {
      builder.ref('path');
      builder.field('text');

      for (const path of this.fileSystem.allFilesUnderPath(dir)) {
        const text = this.fileSystem.readFile(path);
        builder.add({path, text});
      }
    });

    return Promise.resolve();
  }
}
