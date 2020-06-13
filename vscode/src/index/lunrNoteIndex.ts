import { NoteIndex } from "./NoteIndex";
import { FileSystem } from "../utils/FileSystem";

import { extractTags } from '../text_processing/tagExtractor';
import { TagsSet } from './TagsIndex';
import { LunrFullTextSearch } from "./lunrFullTextSearch";

export class LunrNoteIndex implements NoteIndex {
  private _lunrSearch = new LunrFullTextSearch();
  private _tags = new TagsSet();

  constructor(private fileSystem: FileSystem) {}

  public search = (query: string) => this._lunrSearch.search(query);

  public index = (dir: string) => this.indexAllFiles(dir);

  public allTags = () => {
    return this._tags.allTags();
  };

  private indexAllFiles = async (dir: string) => {
    this._tags.clear();
    this._lunrSearch.reset();
    const jobs: Promise<void>[] = [];

    for (const path of this.fileSystem.allFilesUnderPath(dir)) {
      if (!this.shouldIndex(path)) { continue; }
      jobs.push(this.indexFile(path));
    }

    await Promise.all(jobs);
    this._lunrSearch.finalise();
  };

  private indexFile = async (path: string) => {
    const text = await this.fileSystem.readFileAsync(path);
    const tags = extractTags(text);
    this._tags.addTags(tags);
    this._lunrSearch.indexFile(path, text, tags);
  };

  private shouldIndex = (path: string) => {
    for (const ext of ['md', 'txt', 'log']) {
      if (path.endsWith(ext)) {
        return true;
      }
    }
    return false;
  };
}
