import { IMultiIndex } from "./MultiIndex";
import { IFileSystem } from '../utils/IFileSystem';

import { InMemoryLinkIndex } from "./InMemoryLinkIndex";
import { MyFts } from "../search/myFts";
import { IFullTextSearch } from "../search/IFullTextSearch";
import { IDiagnostics } from "../diagnostics/IDiagnostics";
import { NullDiagnostics } from "../diagnostics/diagnostics";

export class DefaultMultiIndex implements IMultiIndex {
  private _fullText: IFullTextSearch;
  private _linkIndex = new InMemoryLinkIndex();

  constructor(
    private _fileSystem: IFileSystem,
    workspaceDir: string,
    private _diagnostics: IDiagnostics = new NullDiagnostics()
  )
  {
    this._fullText = new MyFts(_fileSystem, workspaceDir);
  }

  public filenameToAbsPath = (filename: string) => this._linkIndex.filenameToAbsPath(filename);

  public fullTextSearch = async (query: string) => {
    this._diagnostics.trace(`search: "${query}"`);
    const realResults = await this._fullText.search(query);
    return realResults;
  }

  public notes = () => this._linkIndex.notes();

  public containsNote = (path: string) => this._linkIndex.containsNote(path);

  public linksFrom = (path: string) => this._linkIndex.linksFrom(path);

  public linksTo = (path: string) => this._linkIndex.linksTo(path);

  public findAllDeadLinks = () => this._linkIndex.findAllDeadLinks();

  public indexAllFiles = async (dir: string) => {
    this._linkIndex.clear();
    const jobs: Promise<void>[] = [];

    for (const path of this._fileSystem.allFilesUnderPath(dir)) {
      if (!this.shouldIndex(path)) { continue; }
      jobs.push(this.addFile(path));
    }

    await Promise.all(jobs);
    this._linkIndex.finalise();
  };

  public onFileModified = async (path: string, text: string) => {
    if (!this.shouldIndex(path)) { return; }

    const tasks = [
      this._fullText.onFileModified(path, text, []), // todo: tags: not needed
      this._linkIndex.onFileModified(path, text),
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
    this._fullText.addFile(path, text, []); // todo: tags: not needed
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
