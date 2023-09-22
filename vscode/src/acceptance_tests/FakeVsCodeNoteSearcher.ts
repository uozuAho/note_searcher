import { FakeUi } from "./FakeUi";

export class FakeVsCodeNoteSearcher {
  private _registeredCommands: Map<string, any> = new Map();

  constructor(private _ui: FakeUi) { }

  public registerCommand = (command: string, callback: any) => {
    this._registeredCommands.set(command, callback);
    return { dispose: () => { } };
  };

  public searchResults = () => {
    return this._ui.searchResults();
  };

  public search = async (query: string) => {
    const callback = this._registeredCommands.get('noteSearcher.search');
    this._ui.setSearchInput(query);
    if (!callback) {
      throw new Error('no callback for noteSearcher.search');
    }
    await callback();
  };

  public openFolder = (path: string) => {
    this._ui.openFolder(path);
  };
}
