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
  openFile = (path: any) => {};
  showTags = (tags: string[]) => {};
  copyToClipboard = (text: string) => Promise.resolve();
  startNewNote = (path: string) => Promise.resolve();
  promptForNewNoteName = (noteId: string) => Promise.resolve(noteId);
  getCurrentFile = () => null;
  currentlyOpenDir = () => null;
  promptForSearch = (prefill: string) => Promise.resolve(prefill);
  showSearchResults = (files: string[]) => Promise.resolve();
  showNotification = (message: string) => Promise.resolve();
  showDeadLinks = (links: Link[]) => {};
  showBacklinks = (links: string[]) => {};
  showForwardLinks = (links: string[]) => {};
  notifyIndexingStarted = (indexingTask: Promise<void>) => {};
  showError = (e: Error) => Promise.resolve();
  addNoteSavedListener = (listener: FileChangeListener) => {};
  addNoteDeletedListener = (listener: FileDeletedListener) => {};
  addMovedViewToDifferentNoteListener = (listener: FileChangeListener) => {};
  createNoteSavedHandler = () => { return { dispose: () => {} }; };
  createNoteDeletedHandler = () => { return { dispose: () => {} }; };
  createMovedViewToDifferentNoteHandler = () => { return { dispose: () => {} }; };
}

class FakeVsCodeExtensionContext implements VsCodeExtensionContext {
  subscriptions: { dispose(): any; }[] = [];
}

// fake out top level vscode apis required by main.activate
jest.mock('../ui/uiCreator', () => {
  return {
    // todo: prolly need access to this ui in the tests
    createNoteSearcherUi: () => new FakeUi()
  };
});

jest.mock('../vs_code_apis/registryCreator', () => {
  return {
    createVsCodeRegistry: () => {
      return {
        registerCommand: () => {}
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

// encompases vscode and note searcher's UI
class FakeVsCodeNoteSearcher {
  public searchResults = () => {
    return [];
  };
  public search = async (arg0: string) => {
  };
  public openFolder = async (arg0: any) => {
  };
}

describe('note searcher, demo dir', () => {
  let ui: FakeVsCodeNoteSearcher;

  beforeAll(async () => {
    await activate(new FakeVsCodeExtensionContext());
    ui = new FakeVsCodeNoteSearcher();
  });

  it('indexes workspace on startup', async () => {
    await ui.openFolder('src/note_searcher/demo_dir');
    await ui.search('cheese');
    expect(ui.searchResults()).toEqual([
      'cheese.md',
      'cheese.md',
      'cheese_hat.md',
      'trains.md',
      'readme.md',
    ]);
  });

  // todo: next: i want this test to continue my indexing branch:
  // describe('on file deleted', () => {
  //   it('removes links to the deleted file', async () => {
  //   });
  // });
});
