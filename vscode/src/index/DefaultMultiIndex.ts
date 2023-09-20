import { MultiIndex } from "./MultiIndex";
import { FileSystem } from "../utils/FileSystem";

import { extractTags } from '../text_processing/tagExtractor';
import { TagSet } from './TagIndex';
import { InMemoryLinkIndex } from "./InMemoryLinkIndex";
import { LunrDualFts } from "../search/lunrDualFts";
import { NoteSearcherConfig, NoteSearcherConfigImpl } from "../utils/NoteSearcherConfig";

export class DefaultMultiIndex implements MultiIndex {
  private _fullText: LunrDualFts;
  private _tags = new TagSet();
  private _linkIndex = new InMemoryLinkIndex();
  private _config: NoteSearcherConfig;

  constructor(
    private _fileSystem: FileSystem,
    _workspaceDir: string)
  {
    this._fullText = new LunrDualFts(_fileSystem);
    this._config = NoteSearcherConfigImpl
      .fromWorkspace(_workspaceDir, _fileSystem);
  }

  public onFileModified = async (path: string, text: string) => {
    // todo: merge these two
    if (!this.shouldIndex(path)) { return; }
    if (this._config.isIgnored(path)) { return; }

    const tags = extractTags(text);

    const tasks = [
      this._fullText.onFileModified(path, text, tags),
      this._linkIndex.onFileModified(path, text)
    ];

    await Promise.all(tasks);
  };

  public filenameToAbsPath = (filename: string) => this._linkIndex.filenameToAbsPath(filename);

  public search = (query: string) => this._fullText.search(query);

  public allTags = () => this._tags.allTags();

  public notes = () => this._linkIndex.notes();

  public containsNote = (path: string) => this._linkIndex.containsNote(path);

  public linksFrom = (path: string) => this._linkIndex.linksFrom(path);

  public linksTo = (path: string) => this._linkIndex.linksTo(path);

  public findAllDeadLinks = () => this._linkIndex.findAllDeadLinks();

  public addFile = async (path: string) => {
    const text = await this._fileSystem.readFileAsync(path);
    this._linkIndex.addFile(path, text);
    const tags = extractTags(text);
    this._tags.addTags(tags);
    this._fullText.addFile(path, text, tags);
  };

  public indexAllFiles = async (dir: string) => {
    this._tags.clear();
    this._linkIndex.clear();
    this._fullText = new LunrDualFts(this._fileSystem);
    const jobs: Promise<void>[] = [];

    for (const path of this._fileSystem.allFilesUnderPath(dir, this._config.isIgnored)) {
      if (!this.shouldIndex(path)) { continue; }
      jobs.push(this.addFile(path));
    }

    await Promise.all(jobs);
    this._linkIndex.finalise();
    this._fullText.finalise();
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
