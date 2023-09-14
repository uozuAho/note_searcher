import { FullTextSearch } from "./FullTextSearch";
import { LunrFullTextSearch } from "./lunrFullTextSearch";
import { FileSystem } from "../utils/FileSystem";
import { extractTags } from '../text_processing/tagExtractor';

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
  private _modifiedFiles: Set<string> = new Set();
  private _fileSystem: FileSystem;

  constructor(fileSystem: FileSystem) {
    this._fileSystem = fileSystem;
    this._staticIndex = new LunrFullTextSearch();
    this._dynamicIndex = new LunrFullTextSearch();
  }

  // todo: remove reset?
  public reset = () => this._staticIndex.reset();
  public finalise = () => this._staticIndex.finalise();
  public indexFile = (path: string, text: string, tags: string[]) =>
    this._staticIndex.indexFile(path, text, tags);

  public search = async (query: string) => {
    const results: {path: string, score: number}[] = [];

    const stat = await this._staticIndex.searchWithScores(query);
    for (const {path, score} of stat) {
      // disregard modified files in static results
      if (this._modifiedFiles.has(path)) { continue; }
      results.push({path, score});
    }

    const dyn = await this._dynamicIndex.searchWithScores(query);
    for (const {path, score} of dyn) {
      results.push({path, score});
    }

    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.path);
  };

  public onFileModified = async (path: string, text: string, tags: string[]) => {
    this._modifiedFiles.add(path);
    this._dynamicIndex = new LunrFullTextSearch();

    for (const file of this._modifiedFiles) {
      const text = await this._fileSystem.readFileAsync(file);
      const tags = extractTags(text);
      this._dynamicIndex.indexFile(file, text, tags);
    }

    this._dynamicIndex.finalise();
  };
}
