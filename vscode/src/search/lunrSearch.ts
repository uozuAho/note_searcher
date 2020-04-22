import * as lunr from 'lunr';

import { FullTextSearch } from "./FullTextSearch";
import { FileSystem } from "../utils/FileSystem";
import { newDiagnostics } from '../diagnostics/diagnostics';

export class LunrSearch implements FullTextSearch {
  private _index: lunr.Index | null = null;
  private _diagnostics = newDiagnostics('LunrSearch');

  constructor(private fileSystem: FileSystem) {}

  public search = (query: string) => {
    this.trace('search');

    if (!this._index) { return Promise.resolve([]); }

    return Promise.resolve(this._index.search(query).map(r => r.ref));
  };

  public index = (dir: string) => {
    this.trace('index start');

    this._index = lunr(builder => {
      builder.ref('path');
      builder.field('text');

      for (const path of this.fileSystem.allFilesUnderPath(dir)) {
        if (!this.shouldIndex(path)) { continue; }

        this.trace(`indexing ${path}`);

        const text = this.fileSystem.readFile(path);
        builder.add({path, text});
      }
    });

    this.trace('index complete');

    return Promise.resolve();
  };

  private shouldIndex = (path: string) => {
    for (const ext of ['md', 'txt', 'log']) {
      if (path.endsWith(ext)) {
        return true;
      }
    }
    return false;
  };

  private trace = (message: string) => {
    this._diagnostics.trace(message);
  };
}
