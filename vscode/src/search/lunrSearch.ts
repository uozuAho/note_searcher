import * as lunr from 'lunr';

import { FullTextSearch } from "./FullTextSearch";
import { FileSystem } from "../utils/FileSystem";
import { newDiagnostics } from '../diagnostics/diagnostics';
import { extractTags } from '../text_processing/tagExtractor';

const NUM_RESULTS = 10;

export class LunrSearch implements FullTextSearch {
  private _index: lunr.Index | null = null;
  private _diagnostics = newDiagnostics('LunrSearch');

  constructor(private fileSystem: FileSystem) {}

  public search = (query: string) => {
    this.trace('search');

    if (!this._index) { return Promise.resolve([]); }

    query = this.expandQueryTags(query);

    return Promise.resolve(this._index
      .search(query)
      .slice(0, NUM_RESULTS)
      .map(r => r.ref));
  };

  public index = (dir: string) => {
    this.trace('index start');

    this._index = lunr(builder => {
      builder.ref('path');
      builder.field('text');
      builder.field('tags');

      for (const path of this.fileSystem.allFilesUnderPath(dir)) {
        if (!this.shouldIndex(path)) { continue; }

        this.trace(`indexing ${path}`);

        const text = this.fileSystem.readFile(path);
        // hack: add tags as a single string that gets tokenized. This
        // means I don't have to figure out how to make my own tokenizer
        const tags = extractTags(text).join(' ');
        builder.add({path, text, tags});
      }
    });

    this.trace('index complete');

    return Promise.resolve();
  };

  public expandQueryTags = (query: string) => {
    return query.replace(/(\s|^|\+|-)#(.+?)\b/g, "$1tags:$2")
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
