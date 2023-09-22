/**
 * The highest level tests for this extension. Tests the whole note searcher
 * app, minus the UI. I've previously tried
 * https://www.npmjs.com/package/vscode-extension-tester, but as with most UI
 * testing techniques, it's slow and brittle.
 */

import { Link } from "../index/LinkIndex";
import { activate } from "../main";
import { FileChangeListener, FileDeletedListener, NoteSearcherUi } from "../ui/NoteSearcherUi";
import { VsCodeExtensionContext } from "../vs_code_apis/extensionContext";

const _path = require('path');
const demoDir = _path.resolve(__dirname, '../../demo_dir');

class FakeUi implements NoteSearcherUi {
  // UI interface
  public openFile = (path: any) => {};
  public showTags = (tags: string[]) => {};
  public copyToClipboard = (text: string) => Promise.resolve();
  public startNewNote = (path: string) => Promise.resolve();
  public promptForNewNoteName = (noteId: string) => Promise.resolve(noteId);
  public getCurrentFile = () => null;
  public currentlyOpenDir = () => this._currentlyOpenDir;
  public promptForSearch = (prefill: string) => Promise.resolve(this._searchInput);
  public showSearchResults = (files: string[]) => {
    this._searchResults = files;
    return Promise.resolve();
  };
  public showNotification = (message: string) => Promise.resolve();
  public showDeadLinks = (links: Link[]) => {};
  public showBacklinks = (links: string[]) => {};
  public showForwardLinks = (links: string[]) => {};
  public notifyIndexingStarted = (indexingTask: Promise<void>) => {};
  public showError = (e: Error) => Promise.resolve();
  public addNoteSavedListener = (listener: FileChangeListener) => {};
  public addNoteDeletedListener = (listener: FileDeletedListener) => {};
  public addMovedViewToDifferentNoteListener = (listener: FileChangeListener) => {};
  public createNoteSavedHandler = () => { return { dispose: () => {} }; };
  public createNoteDeletedHandler = () => { return { dispose: () => {} }; };
  public createMovedViewToDifferentNoteHandler = () => { return { dispose: () => {} }; };
  // end UI interface

  private _currentlyOpenDir: string | null = null;
  private _searchInput: string | undefined;
  private _searchResults: string[] = [];

  public openFolder = (path: string) => this._currentlyOpenDir = path;
  public setSearchInput = (query: string) => this._searchInput = query;
  public searchResults = () => this._searchResults;
}

// encompases vscode and note searcher's UI
class FakeVsCodeNoteSearcher {
  private _registeredCommands: Map<string, any> = new Map();

  constructor(private _ui: FakeUi) {}

  public registerCommand = (command: string, callback: any) => {
    this._registeredCommands.set(command, callback);
    return { dispose: () => {} };
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

const ui = new FakeUi();
const vscode = new FakeVsCodeNoteSearcher(ui);

class FakeVsCodeExtensionContext implements VsCodeExtensionContext {
  subscriptions: { dispose(): any; }[] = [];
}

jest.mock('../ui/uiCreator', () => {
  return {
    createNoteSearcherUi: () => ui
  };
});

jest.mock('../vs_code_apis/registryCreator', () => {
  return {
    createVsCodeRegistry: (): VsCodeRegistry => {
      return {
        registerCommand: (command: string, callback: any) => {
          return vscode.registerCommand(command, callback);
        },
        registerCompletionItemProvider: (
          selector: string[],
          provider: any,
          triggerChars: string[]) =>
        {
          return { dispose: () => {} };
        },
        registerDefinitionProvider: (selector: string[], provider: any) => {
          return { dispose: () => {} };
        }
      };
    }
  };
});

jest.mock('../tag_completion/tagCompleterCreator', () => {
  return {
    createTagCompleter: () => {
      return {
        provideCompletionItems: () => {}
      };
    }
  };
});

jest.mock('../definition_provider/defProviderCreator', () => {
  return {
    createWikiLinkDefinitionProvider: () => {
      return {
        provideDefinition: () => {}
      };
    }
  };
});

describe('note searcher, demo dir', () => {
  beforeAll(async () => {
    vscode.openFolder(demoDir);
    await activate(new FakeVsCodeExtensionContext());
  });

  it('indexes workspace on startup', async () => {
    await vscode.search('cheese');
    expect(vscode.searchResults()).toEqual([
      _path.join(demoDir, 'cheese.md'),
      _path.join(demoDir, 'subdir/cheese.md'),
      _path.join(demoDir, 'cheese_hat.md'),
      _path.join(demoDir, 'trains.md'),
      _path.join(demoDir, 'readme.md'),
    ]);
  });

  // todo: next: i want this test to continue my indexing branch:
  // describe('on file deleted', () => {
  //   it('removes links to the deleted file', async () => {
  //   });
  // });
});
