/**
 * The highest level tests for this extension. Tests the whole note searcher
 * app, minus the UI. I've previously tried
 * https://www.npmjs.com/package/vscode-extension-tester, but as with most UI
 * testing techniques, it's slow and brittle.
 */

import { activate } from "../main";
import { VsCodeExtensionContext } from "../vs_code_apis/extensionContext";
import { FakeUi } from "./FakeUi";
import { FakeVsCodeNoteSearcher } from "./FakeVsCodeNoteSearcher";
import { FakeVsCodeRegistry } from "./FakeVsCodeRegistry";

const _path = require('path');
const demoDir = _path.resolve(__dirname, '../../demo_dir');

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
    createVsCodeRegistry: () => new FakeVsCodeRegistry(vscode)
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
