import { MultiIndex } from "./MultiIndex";
import { IFileSystem } from '../utils/IFileSystem';

import { extractTags } from '../text_processing/tagExtractor';
import { TagSet } from './TagIndex';
import { InMemoryLinkIndex } from "./InMemoryLinkIndex";
import { LunrDualFts } from "../search/lunrDualFts";

export class DefaultMultiIndex implements MultiIndex {
  private _fullText: LunrDualFts;
  private _tags = new TagSet();
  private _linkIndex = new InMemoryLinkIndex();

  constructor(
    private _fileSystem: IFileSystem,
    _workspaceDir: string)
  {
    this._fullText = new LunrDualFts(_fileSystem);
  }

  public filenameToAbsPath = (filename: string) => this._linkIndex.filenameToAbsPath(filename);

  public fullTextSearch = (query: string) => this._fullText.search(query);

  public allTags = () => this._tags.allTags();

  public notes = () => this._linkIndex.notes();

  public containsNote = (path: string) => this._linkIndex.containsNote(path);

  public linksFrom = (path: string) => this._linkIndex.linksFrom(path);

  public linksTo = (path: string) => this._linkIndex.linksTo(path);

  public findAllDeadLinks = () => this._linkIndex.findAllDeadLinks();

  public indexAllFiles = async (dir: string) => {
    this._tags.clear();
    this._linkIndex.clear();
    this._fullText = new LunrDualFts(this._fileSystem);
    const jobs: Promise<void>[] = [];

    for (const path of this._fileSystem.allFilesUnderPath(dir)) {
      if (!this.shouldIndex(path)) { continue; }
      jobs.push(this.addFile(path));
    }

    await Promise.all(jobs);
    this._linkIndex.finalise();
    this._fullText.finalise();
  };

  public onFileModified = async (path: string, text: string) => {
    if (!this.shouldIndex(path)) { return; }

    const tags = extractTags(text);

    const tasks = [
      this._fullText.onFileModified(path, text, tags),
      this._linkIndex.onFileModified(path, text),
      // note: I can't see an easy way to make tag index consistent here without
      //       a full re-index, so we just add the new tags. I don't really use
      //       tags so I figure it's not a big deal.
      this._tags.addTags(tags),
    ];

    await Promise.all(tasks);
  };

  public onFileDeleted = async (path: string) => {
    if (!this.shouldIndex(path)) { return; }

    const tasks = [
      this._fullText.onFileDeleted(path),
      this._linkIndex.onFileDeleted(path),
    ];

    await Promise.all(tasks);
  };

  private addFile = async (path: string) => {
    const text = await this._fileSystem.readFileAsync(path);
    this._linkIndex.addFile(path, text);
    const tags = extractTags(text);
    this._tags.addTags(tags);
    this._fullText.addFile(path, text, tags);
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
