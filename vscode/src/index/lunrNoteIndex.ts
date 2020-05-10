import * as lunr from 'lunr';

import { NoteIndex } from "./NoteIndex";
import { FileSystem } from "../utils/FileSystem";
import { createDiagnostics } from '../diagnostics/diagnostics';
import { extractTags } from '../text_processing/tagExtractor';
import { GoodSet } from '../utils/goodSet';

const NUM_RESULTS = 10;

// Overrides lunr's global token separator, which includes hyphens.
// Removing hyphens allows hyphenated tags to be lexed into single
// tokens.
lunr.tokenizer.separator = /\s+/;

// I think there's a bug/oversight in lunr 2.3.8 - overriding the token
// separator doesn't override the separator for the query parser. Thus, I
// override it here to ensure queries are tokenised in the same way document
// text is.
// An alternative is to implement my own query parser.
(lunr as any).QueryLexer.termSeparator = lunr.tokenizer.separator;


export class LunrNoteIndex implements NoteIndex {
  private _index: lunr.Index | null = null;
  private _tags: GoodSet<string> = new GoodSet();
  private _diagnostics = createDiagnostics('LunrSearch');

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

  public index = async (dir: string) => {
    this.trace('index start');

    const builder = this.createIndexBuilder();
    const jobs: Promise<void>[] = [];

    for (const path of this.fileSystem.allFilesUnderPath(dir)) {
      if (!this.shouldIndex(path)) { continue; }

      const job = this.fileSystem.readFileAsync(path)
        .then(text => {
          const tags = extractTags(text);
          tags.forEach(t => this._tags.add(t));
          builder.add({path, text, tags});
        });

      jobs.push(job);
    }

    await Promise.all(jobs);

    this._index = builder.build();

    this.trace('index complete');
  };

  public expandQueryTags = (query: string) => {
    return query.replace(/(\s|^|\+|-)#(.+?)\b/g, "$1tags:$2");
  };

  public allTags = () => {
    return Array.from(this._tags.values());
  };

  private createIndexBuilder = () => {
    const builder = new lunr.Builder();

    builder.pipeline.add(
      lunr.trimmer,
      lunr.stopWordFilter,
      lunr.stemmer
    );

    builder.searchPipeline.add(
      lunr.stemmer
    );

    builder.ref('path');
    builder.field('text');
    builder.field('tags');

    return builder;
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
