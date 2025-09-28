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
import { IVsCodeExtensionContext } from "../vs_code_apis/extensionContext";
import { FakeUi } from "./FakeUi";
import { FakeVsCodeNoteSearcher } from "./FakeVsCodeNoteSearcher";
import { FakeVsCodeRegistry } from "./FakeVsCodeRegistry";
import { Link } from "../index/LinkIndex";
import { InMemFileSystem } from "../utils/InMemFileSystem";
import { IFileSystem } from '../utils/IFileSystem';
import { allFilesUnderPath } from "./readAllFiles";

import _path = require('path');
const demoDir = _path.resolve(__dirname, '../../demo_dir');

let _fakeUi = new FakeUi();
let ns = new FakeVsCodeNoteSearcher(_fakeUi);
const demoDirFiles = allFilesUnderPath(demoDir);
let fs: IFileSystem = InMemFileSystem.fromFiles(demoDirFiles);

class FakeVsCodeExtensionContext implements IVsCodeExtensionContext {
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
    createVsCodeRegistry: () => new FakeVsCodeRegistry(ns)
  };
});

jest.mock('../autocomplete/tagCompleterCreator', () => {
  return {
    createTagCompleter: () => {
      return {
        provideCompletionItems: () => {}
      };
    }
  };
});

jest.mock('../autocomplete/createWikilinkCompleter', () => {
  return {
    createWikilinkCompleter: () => {
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

jest.mock('../utils/NodeFileSystem', () => {
  return {
    createFileSystem: () => fs
  };
});

describe('on starting in the demo dir', () => {
  beforeAll(async () => {
    await activate(new FakeVsCodeExtensionContext());
    ns.openFolder(demoDir);
  });

  it('full text search works', async () => {
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
      _path.join(demoDir, 'cheese.md'),
      _path.join(demoDir, 'readme.md'),
    ]);
  });

  it('searching an empty string does not run search', async () => {
    const previousSearchResults = ns.searchResults();
    await ns.search('');
    expect(ns.searchResults()).toEqual(previousSearchResults);
  });

  it('shows correct links to and from readme', async () => {
    const readme = _path.join(demoDir, 'readme.md');

    await ns.openFile(readme);

    expect(ns.linksToThisNote()).toEqual([
      _path.join(demoDir, 'trains.md'),
    ]);

    expect(ns.linksFromThisNote()).toEqual([
      _path.join(demoDir, 'cheese.md'),
      _path.join(demoDir, 'subdir/cheese.md'),
      _path.join(demoDir, 'trains.md'),
    ]);
  });
});

describe('on file deleted', () => {
  const readme = _path.join(demoDir, 'readme.md');
  const trains = _path.join(demoDir, 'trains.md');

  beforeAll(async () => {
    fs = InMemFileSystem.fromFiles(demoDirFiles);
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

  it('removes links to the deleted file', async () => {
    expect(ns.linksFromThisNote()).not.toContain(trains);
  });

  it('adds deleted file to dead links', async () => {
    const deadLink = new Link(readme, trains);
    expect(ns.deadLinks()).toContainEqual(deadLink);
  });
});

describe('on file moved', () => {
  const readme = _path.join(demoDir, 'readme.md');
  const cheese = _path.join(demoDir, 'cheese.md');
  const oldTrainsPath = _path.join(demoDir, 'trains.md');
  const newTrainsPath = _path.join(demoDir, 'subdir/trains.md');

  beforeAll(async () => {
    fs = InMemFileSystem.fromFiles(demoDirFiles);
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

  it('links to this note point to new location', async () => {
    await ns.openFile(cheese);
    expect(ns.linksToThisNote()).toContain(newTrainsPath);

    await ns.openFile(newTrainsPath);
    expect(ns.linksToThisNote()).toContain(readme);
  });

  it('links from this note point to new location', async () => {
    await ns.openFile(readme);
    expect(ns.linksFromThisNote()).toContain(newTrainsPath);

    expect(ns.linksFromThisNote()
      .filter(link => link === newTrainsPath)
      .length).toBe(1);

    // todo: fix this once I've figured out what 'links to' should contain
    // (currently this is the lead md link)
    // expect(ns.linksFromThisNote()).not.toContain(oldTrainsPath);

    await ns.openFile(newTrainsPath);
    expect(ns.linksFromThisNote()).toContain(cheese);
  });

  it('updates dead links', async () => {
    // these are markdown links, so their paths become
    // invalid when the file is moved
    const deadLinks = ns.deadLinks();
    expect(deadLinks).toContainEqual(new Link(readme, oldTrainsPath));

    const incorrectReadmePath = _path.join(demoDir, 'subdir/readme.md');
    expect(deadLinks).toContainEqual(new Link(newTrainsPath, incorrectReadmePath));

    expect(deadLinks).not.toContainEqual(new Link(cheese, oldTrainsPath));
  });
});

describe('on file renamed', () => {
  const readme = _path.join(demoDir, 'readme.md');
  const cheese = _path.join(demoDir, 'cheese.md');
  const oldTrainsPath = _path.join(demoDir, 'trains.md');
  const newTrainsPath = _path.join(demoDir, 'new_trains.md');

  beforeAll(async () => {
    fs = InMemFileSystem.fromFiles(demoDirFiles);
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

  it('links to the renamed note are broken', async () => {
    // markdown link
    expect(ns.deadLinks()).toContainEqual(new Link(readme, oldTrainsPath));
    // wiki link
    expect(ns.deadLinks()).toContainEqual(new Link(readme, 'trains'));
  });

  it('links from the renamed note still work', async () => {
    await ns.openFile(newTrainsPath);
    expect(ns.linksFromThisNote()).toContain(readme);
    expect(ns.linksFromThisNote()).toContain(cheese);
  });
});
