/**
 * The highest level tests for this extension. Tests the whole note searcher app
 * on a real filesystem (the demo dir), minus the UI.
 *
 * You should be able to follow along with these tests using the real extension,
 * if you want to manually confirm functionality.
 *
 * I've previously tried https://www.npmjs.com/package/vscode-extension-tester,
 * but as with most UI testing techniques, it's slow and brittle.
 */

import { activate } from "../main";
import { VsCodeExtensionContext } from "../vs_code_apis/extensionContext";
import { FakeUi } from "./FakeUi";
import { FakeVsCodeNoteSearcher } from "./FakeVsCodeNoteSearcher";
import { FakeVsCodeRegistry } from "./FakeVsCodeRegistry";
import { Link } from "../index/LinkIndex";
import { createFileSystem } from "../utils/FileSystem";

const fs = createFileSystem();
const _path = require('path');
const demoDir = _path.resolve(__dirname, '../../demo_dir');

const _fakeUi = new FakeUi();
const ui = new FakeVsCodeNoteSearcher(_fakeUi);

class FakeVsCodeExtensionContext implements VsCodeExtensionContext {
  subscriptions: { dispose(): any; }[] = [];
}

jest.mock('../ui/uiCreator', () => {
  return {
    createNoteSearcherUi: () => _fakeUi
  };
});

jest.mock('../vs_code_apis/registryCreator', () => {
  return {
    createVsCodeRegistry: () => new FakeVsCodeRegistry(ui)
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
    ui.openFolder(demoDir);
    await activate(new FakeVsCodeExtensionContext());
  });

  it('indexes workspace on startup', async () => {
    await ui.search('cheese');
    expect(ui.searchResults()).toEqual([
      _path.join(demoDir, 'cheese.md'),
      _path.join(demoDir, 'subdir/cheese.md'),
      _path.join(demoDir, 'cheese_hat.md'),
      _path.join(demoDir, 'trains.md'),
      _path.join(demoDir, 'readme.md'),
    ]);
  });

  describe('on file deleted', () => {
    const readme = _path.join(demoDir, 'readme.md');
    const trains = _path.join(demoDir, 'trains.md');
    const trainsText = fs.readFile(trains);

    beforeAll(async () => {
      await ui.openFile(readme);
      expect(ui.linksToThisNote()).toContain(trains);

      fs.deleteFile(trains);
      await ui.notifyNoteDeleted(trains);
    });

    afterAll(async () => {
      fs.writeFile(trains, trainsText);
    });

    it('is not in search results', async () => {
      await ui.search('trains');
      expect(ui.linksToThisNote()).not.toContain(trains);
    });

    it('removes incoming links from the deleted file', async () => {
      expect(ui.linksToThisNote()).not.toContain(trains);
    });

    // todo: fix this when fixing all 'links to' behaviour
    it.skip('removes links to the deleted file', async () => {
      expect(ui.linksFromThisNote()).not.toContain(trains);
    });

    it('adds deleted file to dead links', async () => {
      const deadLink = new Link(readme, trains);
      expect(ui.deadLinks()).toContainEqual(deadLink);
    });
  });
});
