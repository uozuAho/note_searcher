import * as lunr from 'lunr';

import { createDiagnostics } from '../diagnostics/diagnostics';
import { FullTextSearch } from "./FullTextSearch";

const NUM_RESULTS = 20;

// lunr's default separator is hyphens and whitespace: /[\s\-]+/;
// see the tests for this file for why that's no good for me. In short,
// I want hyphenated tags, markdown links, words separated by slashes
lunr.tokenizer.separator = /[\s\[\]/]+/;

// I think there's a bug/oversight in lunr 2.3.8 - overriding the token
// separator doesn't override the separator for the query parser. Thus, I
// override it here to ensure queries are tokenised in the same way document
// text is.
// An alternative is to implement my own query parser.
(lunr as any).QueryLexer.termSeparator = lunr.tokenizer.separator;

export class LunrFullTextSearch implements FullTextSearch {
  private _index: lunr.Index | null = null;
  private _diagnostics = createDiagnostics('LunrSearch');
  private _indexBuilder = this.createIndexBuilder();

  public reset = () => {
    this._index = null;
    this._indexBuilder = this.createIndexBuilder();
  };

  public finalise = () => {
    this._index = this._indexBuilder.build();
  };

  public search = (query: string) => {
    this.trace('search');

    if (!this._index) {
      if (!this._indexBuilder) {
        return Promise.resolve([]);
      } else {
        // This is a hack for tests, so that tests don't have to call finalise.
        // Note that you _should_ call finalise once indexing is complete.
        this._index = this._indexBuilder.build();
      }
    }

    query = this.expandQueryTags(query);

    return Promise.resolve(this._index
      .search(query)
      .slice(0, NUM_RESULTS)
      .map(r => r.ref));
  };

  public expandQueryTags = (query: string) => {
    return query.replace(/(\s|^|\+|-)#(.+?)\b/g, "$1tags:$2");
  };

  public indexFile = (path: string, text: string, tags: string[]) => {
    this._indexBuilder.add({ path, text, tags });
  };

  public onFileModified = (path: string, text: string, tags: string[]) => {
    return Promise.resolve();
  };

  private createIndexBuilder() {
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

  private trace = (message: string) => {
    this._diagnostics.trace(message);
  };
}
