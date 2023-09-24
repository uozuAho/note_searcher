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
// todo: read files manually from fs instead, insert into memfs
const realFs = createFileSystem();

let _fakeUi = new FakeUi();
let ns = new FakeVsCodeNoteSearcher(_fakeUi);
let fs: FileSystem = InMemFileSystem.fromFs(demoDir, realFs);

class FakeVsCodeExtensionContext implements VsCodeExtensionContext {
  subscriptions: { dispose(): any; }[] = [];
}

jest.mock('../ui/uiCreator', () => {
  return {
    createNoteSearcherUi: () => {
      _fakeUi = new FakeUi();
      ns = new FakeVsCodeNoteSearcher(_fakeUi);
      // folder needs to be open before activating
      ns.openFolder(demoDir);
      return _fakeUi;
    }
  };
});

jest.mock('../vs_code_apis/registryCreator', () => {
  return {
    // todo: does this hold onto old ui references?
    createVsCodeRegistry: () => new FakeVsCodeRegistry(ns)
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

jest.mock('../utils/FileSystem', () => {
  return {
    createFileSystem: () => fs
  };
});

describe('on starting in the demo dir', () => {
  beforeAll(async () => {
    await activate(new FakeVsCodeExtensionContext());
    ns.openFolder(demoDir);
  });

  it('indexes workspace on startup', async () => {
    await ns.search('cheese');
    expect(ns.searchResults()).toEqual([
      _path.join(demoDir, 'cheese.md'),
      _path.join(demoDir, 'subdir/cheese.md'),
      _path.join(demoDir, 'cheese_hat.md'),
      _path.join(demoDir, 'trains.md'),
      _path.join(demoDir, 'readme.md'),
    ]);

    await ns.search('trains');
    expect(ns.searchResults()).toEqual([
      _path.join(demoDir, 'trains.md'),
      _path.join(demoDir, 'readme.md'),
    ]);
  });
});

describe('on file deleted', () => {
  const readme = _path.join(demoDir, 'readme.md');
  const trains = _path.join(demoDir, 'trains.md');

  beforeAll(async () => {
    fs = InMemFileSystem.fromFs(demoDir, realFs);
    await activate(new FakeVsCodeExtensionContext());
    ns.openFolder(demoDir);
    await ns.openFile(readme);

    fs.deleteFile(trains);
    await ns.notifyNoteDeleted(trains);
  });

  it('is not in search results', async () => {
    await ns.search('trains');
    expect(ns.linksToThisNote()).not.toContain(trains);
  });

  it('removes incoming links from the deleted file', async () => {
    expect(ns.linksToThisNote()).not.toContain(trains);
  });

  // todo: fix this when fixing all 'links to' behaviour
  it.skip('removes links to the deleted file', async () => {
    expect(ns.linksFromThisNote()).not.toContain(trains);
  });

  it('adds deleted file to dead links', async () => {
    const deadLink = new Link(readme, trains);
    expect(ns.deadLinks()).toContainEqual(deadLink);
  });
});

describe('on file moved', () => {
  const readme = _path.join(demoDir, 'readme.md');
  const oldTrainsPath = _path.join(demoDir, 'trains.md');
  const newTrainsPath = _path.join(demoDir, 'subdir/trains.md');

  beforeAll(async () => {
    fs = InMemFileSystem.fromFs(demoDir, realFs);
    await activate(new FakeVsCodeExtensionContext());
    ns.openFolder(demoDir);

    await ns.openFile(readme);
    fs.moveFile(oldTrainsPath, newTrainsPath);
    await ns.notifyNoteMoved(oldTrainsPath, newTrainsPath);
  });

  it('search result points to new location', async () => {
    await ns.search('trains');
    expect(ns.searchResults()).toContain(newTrainsPath);
  });
});
