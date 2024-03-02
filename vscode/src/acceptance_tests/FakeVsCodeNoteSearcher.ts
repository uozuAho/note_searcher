import { FakeUi } from "./FakeUi";

/**
 * Encapsulates everything we can do with VS Code and the note searcher extension.
 */
export class FakeVsCodeNoteSearcher {
  private _registeredCommands: Map<string, any> = new Map();

  constructor(private _ui: FakeUi) { }

  // queries
  public searchResults = () => this._ui.searchResults();
  public linksToThisNote = () => this._ui.linksToThisNote();
  public linksFromThisNote = () => this._ui.linksFromThisNote();
  public deadLinks = () => this._ui.deadLinks();

  // commands
  public notifyNoteDeleted = (path: string) => this._ui.notifyNoteDeleted(path);
  public notifyNoteMoved = (oldPath: string, newPath: string) => this._ui.notifyNoteMoved(oldPath, newPath);
  public openFolder = (path: string) => this._ui.openFolder(path);

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
