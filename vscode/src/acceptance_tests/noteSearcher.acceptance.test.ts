/**
 * The highest level tests for this extension. Tests the whole note searcher app
 * (minus the UI) on the demo directory.
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
import { InMemFileSystem } from "../utils/InMemFileSystem";
import { FileSystem } from "../utils/FileSystem";

const _path = require('path');
const demoDir = _path.resolve(__dirname, '../../demo_dir');
const realFs = createFileSystem();

let _fakeUi = new FakeUi();
// todo: ui/fakeui distinction is not clear
let ui = new FakeVsCodeNoteSearcher(_fakeUi);

class FakeVsCodeExtensionContext implements VsCodeExtensionContext {
  subscriptions: { dispose(): any; }[] = [];
}

jest.mock('../ui/uiCreator', () => {
  return {
    createNoteSearcherUi: () => {
      _fakeUi = new FakeUi();
      ui = new FakeVsCodeNoteSearcher(_fakeUi);
      return _fakeUi;
    }
  };
});

jest.mock('../vs_code_apis/registryCreator', () => {
  return {
    // todo: does this hold onto old ui references?
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

describe('on starting in the demo dir', () => {
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

    await ui.search('trains');
    expect(ui.searchResults()).toEqual([
      _path.join(demoDir, 'trains.md'),
      _path.join(demoDir, 'readme.md'),
    ]);
  });
});

describe('on file deleted', () => {
  const readme = _path.join(demoDir, 'readme.md');
  const trains = _path.join(demoDir, 'trains.md');
  let fs: FileSystem;

  beforeAll(async () => {
    fs = InMemFileSystem.fromFs(demoDir, realFs);
    ui.openFolder(demoDir);
    await activate(new FakeVsCodeExtensionContext());
    await ui.openFile(readme);

    fs.deleteFile(trains);
    await ui.notifyNoteDeleted(trains);
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

describe('on file moved', () => {
  const readme = _path.join(demoDir, 'readme.md');
  const oldTrainsPath = _path.join(demoDir, 'trains.md');
  const newTrainsPath = _path.join(demoDir, 'subdir/trains.md');
  let fs: FileSystem;

  beforeAll(async () => {
    fs = InMemFileSystem.fromFs(demoDir, realFs);
    ui.openFolder(demoDir);
    await activate(new FakeVsCodeExtensionContext());

    await ui.openFile(readme);
    fs.moveFile(oldTrainsPath, newTrainsPath);
    await ui.notifyNoteMoved(oldTrainsPath, newTrainsPath);
  });

  it('search result points to new location', async () => {
    await ui.search('trains');
    expect(ui.searchResults()).toContain(oldTrainsPath);
  });
});
