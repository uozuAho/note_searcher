const _path = require('path');

import * as tmoq from 'typemoq';

import { InMemoryLinkIndex } from "./InMemoryLinkIndex";
import { MockFile } from "../mocks/MockFile";
import { LunrMultiIndex } from "./lunrMultiIndex";
import { createFileSystem, FileSystem } from "../utils/FileSystem";

describe('InMemoryLinkIndex, dead links, mocked filesystem', () => {
  let fileSystem: tmoq.IMock<FileSystem>;
  let linkIndex: InMemoryLinkIndex;

  const setupLinks = (fileLinks: MockFile[]) => {
    for (const file of fileLinks) {
      linkIndex.addFile(file.path(), file.text());
      fileSystem.setup(f => f.fileExists(file.path())).returns(() => true);
    }
    linkIndex.finalise();
  };

  describe('posix paths, markdown links', () => {
    if (process.platform === 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupLinks([
        new MockFile('/a.md', '[](/b.txt)')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('/b.txt');
    });

    it('finds no dead links', () => {
      setupLinks([
        new MockFile('/a.md', '[](/b.txt)'),
        new MockFile('/b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupLinks([
        new MockFile('/a.md', '[](/b/c/e.txt)'),
        new MockFile('/b/c/e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupLinks([
        new MockFile('/b/c/e.txt', '[](/a.md)'),
        new MockFile('/a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to parent dirs', () => {
      setupLinks([
        new MockFile('/b/c/e.txt', '[](../../a.md)'),
        new MockFile('/a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to subdirs', () => {
      setupLinks([
        new MockFile('/a/b.md', '[](c/d.txt)'),
        new MockFile('/a/c/d.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports non-note files', () => {
      setupLinks([
        new MockFile('/a/b.md', '[](c.png)'),
        new MockFile('/a/c.png', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('posix paths, wiki links', () => {
    if (process.platform === 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupLinks([
        new MockFile('/a.md', '[[blah]]')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('blah');
    });

    it('finds no dead links', () => {
      setupLinks([
        new MockFile('/a.md', '[[b]]'),
        new MockFile('/b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupLinks([
        new MockFile('/a.md', '[[e]]'),
        new MockFile('/b/c/e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupLinks([
        new MockFile('/b/c/e.txt', '[[a]]'),
        new MockFile('/a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('windows paths, markdown links', () => {
    if (process.platform !== 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[](c:\\b.txt)')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('c:\\a.md');
      expect(deadLinks[0].targetPath).toBe('c:\\b.txt');
    });

    it('finds no dead links', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[](c:\\b.txt)'),
        new MockFile('c:\\b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[](c:\\b\\c\\e.txt)'),
        new MockFile('c:\\b\\c\\e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupLinks([
        new MockFile('c:\\b\\c\\e.txt', '[](c:\\a.md)'),
        new MockFile('c:\\a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to parent dirs', () => {
      setupLinks([
        new MockFile('c:\\b\\c\\e.txt', '[](..\\..\\a.md)'),
        new MockFile('c:\\a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to subdirs', () => {
      setupLinks([
        new MockFile('c:\\a\\b.md', '[](c\\d.txt)'),
        new MockFile('c:\\a\\c\\d.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports non-note files', () => {
      setupLinks([
        new MockFile('c:\\a\\b.md', '[](c.png)'),
        new MockFile('c:\\a\\c.png', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('windows paths, wiki links', () => {
    if (process.platform !== 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[[blah]]')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('c:\\a.md');
      expect(deadLinks[0].targetPath).toBe('blah');
    });

    it('finds no dead links', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[[b]]'),
        new MockFile('c:\\b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[[e]]'),
        new MockFile('c:\\b\\c\\e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupLinks([
        new MockFile('c:\\b\\c\\e.txt', '[[a]]'),
        new MockFile('c:\\a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });
});

describe('InMemoryLinkIndex, dead links, real filesystem', () => {
  let linkIndex: LunrMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem({
      ignore: ['ignored_stuff']
    });
    linkIndex = new LunrMultiIndex(fs);
  });

  it('finds all dead links in demo dir', async () => {
    await linkIndex.index(_path.resolve(__dirname, '../../demo_dir'));

    // act
    const deadLinks = linkIndex.findAllDeadLinks();

    // assert
    expect(deadLinks).toHaveLength(3);
    expect(deadLinks.map(d => _path.parse(d.sourcePath).base))
      .toStrictEqual(['readme.md', 'readme.md', 'readme.md']);

    expect(deadLinks.map(d => _path.parse(d.targetPath).base))
      .toStrictEqual(['nowhere.md', 'non_existent_note', 'ignored_file']);
  });

  it('ignores dead links in ignored files', async () => {
    await linkIndex.index(_path.resolve(__dirname, '../../demo_dir'));

    const deadLinkSourceNames = linkIndex.findAllDeadLinks()
      .map(l => l.sourcePath)
      .map(p => _path.parse(p).name);

    expect(deadLinkSourceNames).not.toContain('ignored_file');
  });

  it('includes links to ignored files', async () => {
    await linkIndex.index(_path.resolve(__dirname, '../../demo_dir'));

    const deadLinksFromReadmeToIgnoredFile = linkIndex.findAllDeadLinks()
      .filter(l => l.sourcePath.includes('readme'))
      .filter(l => l.targetPath.includes('ignored_file'));

    expect(deadLinksFromReadmeToIgnoredFile.length).toBeGreaterThan(0);
  });
});
