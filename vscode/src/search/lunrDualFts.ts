import { FullTextSearch } from "./FullTextSearch";
import { LunrFullTextSearch } from "./lunrFullTextSearch";

/**
 * FTS that supports file modification.
 *
 * It's called dual because it uses two lunr indexes to achieve this: one that
 * indexes all files once on startup, and a second that indexes files as they
 * are modified.
 */
export class LunrDualFts implements FullTextSearch {
  private _staticIndex: LunrFullTextSearch;
  private _dynamicIndex: LunrFullTextSearch;

  constructor() {
    this._staticIndex = new LunrFullTextSearch();
    this._dynamicIndex = new LunrFullTextSearch();
  }

  public reset = () => this._staticIndex.reset();
  public finalise = () => this._staticIndex.finalise();
  public search = (query: string) => this._staticIndex.search(query);
  public indexFile = (path: string, text: string, tags: string[]) =>
    this._staticIndex.indexFile(path, text, tags);
  public onFileModified = (path: string, text: string, tags: string[]) => {
    return Promise.resolve();
  };
}
