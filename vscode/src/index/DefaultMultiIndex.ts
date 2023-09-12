import { MultiIndex } from "./MultiIndex";
import { FileSystem } from "../utils/FileSystem";

import { extractTags } from '../text_processing/tagExtractor';
import { TagSet } from './TagIndex';
import { LunrFullTextSearch } from "../search/lunrFullTextSearch";
import { InMemoryLinkIndex } from "./InMemoryLinkIndex";

export class DefaultMultiIndex implements MultiIndex {
  private _lunrSearch = new LunrFullTextSearch();
  private _tags = new TagSet();
  private _linkIndex = new InMemoryLinkIndex();

  constructor(private fileSystem: FileSystem) {}

  public onFileModified = (path: string, text: string, tags: string[]) => Promise.resolve();

  public filenameToAbsPath = (filename: string) => this._linkIndex.filenameToAbsPath(filename);

  public search = (query: string) => this._lunrSearch.search(query);

  public index = (dir: string) => this.indexAllFiles(dir);

  public allTags = () => this._tags.allTags();

  public notes = () => this._linkIndex.notes();

  public containsNote = (path: string) => this._linkIndex.containsNote(path);

  public linksFrom = (path: string) => this._linkIndex.linksFrom(path);

  public linksTo = (path: string) => this._linkIndex.linksTo(path);

  public findAllDeadLinks = () => this._linkIndex.findAllDeadLinks();

  // todo: make this private
  public indexFile = async (path: string) => {
    const text = await this.fileSystem.readFileAsync(path);
    this._linkIndex.addFile(path, text);
    const tags = extractTags(text);
    this._tags.addTags(tags);
    this._lunrSearch.indexFile(path, text, tags);
  };

  private indexAllFiles = async (dir: string) => {
    this._tags.clear();
    this._linkIndex.clear();
    this._lunrSearch.reset();
    const jobs: Promise<void>[] = [];

    for (const path of this.fileSystem.allFilesUnderPath(dir)) {
      if (!this.shouldIndex(path)) { continue; }
      jobs.push(this.indexFile(path));
    }

    await Promise.all(jobs);
    this._linkIndex.finalise();
    this._lunrSearch.finalise();
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
