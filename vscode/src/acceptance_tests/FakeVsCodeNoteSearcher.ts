import { IFileSystem } from "../utils/IFileSystem";
import { FakeUi } from "./FakeUi";

/**
 * Encapsulates everything we can do with VS Code and the note searcher extension.
 */
export class FakeVsCodeNoteSearcher {
  private _registeredCommands: Map<string, any> = new Map();

  constructor(private _ui: FakeUi, private _fs: IFileSystem) { }

  // queries
  public searchResults = () => this._ui.searchResults();
  public linksToThisNote = () => this._ui.linksToThisNote();
  public linksFromThisNote = () => this._ui.linksFromThisNote();
  public deadLinks = () => this._ui.deadLinks();

  // commands
  public openFolder = (path: string) => this._ui.openFolder(path);

  public deleteFile = async (path: string) => {
    this._fs.deleteFile(path);
    await this._ui.notifyNoteDeleted(path);
  };

  public moveFile = async (oldPath: string, newPath: string) => {
    this._fs.moveFile(oldPath, newPath);
    await this._ui.notifyNoteMoved(oldPath, newPath);
  };

  public renameFile = async (oldPath: string, newPath: string) => {
    this._fs.moveFile(oldPath, newPath);
    await this._ui.notifyNoteMoved(oldPath, newPath);
  };

  public openFile = async (path: any) => {
    this._ui.openFile(path);
    return this._ui.moveViewToNote(path);
  };

  public registerCommand = (command: string, callback: any) => {
    this._registeredCommands.set(command, callback);
    return { dispose: () => { } };
  };

  public search = async (query: string) => {
    const callback = this._registeredCommands.get('noteSearcher.search');
    this._ui.setSearchInput(query);
    if (!callback) {
      throw new Error('no callback for noteSearcher.search');
    }
    await callback();
  };
}
