const _path = require('path');

import * as tmoq from 'typemoq';

import { DeadLinkFinder } from "./DeadLinkFinder";
import { MapLinkIndex } from "../index/noteLinkIndex";
import { MockFile } from "../mocks/MockFile";
import { LunrNoteIndex } from "../index/lunrNoteIndex";
import { createFileSystem, FileSystem } from "../utils/FileSystem";
import { NoteIndex } from "../index/NoteIndex";

describe('dead link finder, mocked filesystem', () => {
  let fileSystem: tmoq.IMock<FileSystem>;
  let linkIndex: MapLinkIndex;
  let finder: DeadLinkFinder;

  const setupLinks = (fileLinks: MockFile[]) => {
    for (const file of fileLinks) {
      linkIndex.addFile(file.path(), file.text());
      fileSystem.setup(f => f.fileExists(file.path())).returns(() => true);
    }
    linkIndex.buildBacklinkIndex();
  };

  describe('posix paths, markdown links', () => {
    if (process.platform === 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new MapLinkIndex();
      finder = new DeadLinkFinder(linkIndex, fileSystem.object);
    });

    it('finds dead link', () => {
      setupLinks([
        new MockFile('/a.md', '[](/b.txt)')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('/b.txt');
    });

    it('finds no dead links', () => {
      setupLinks([
        new MockFile('/a.md', '[](/b.txt)'),
        new MockFile('/b.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupLinks([
        new MockFile('/a.md', '[](/b/c/e.txt)'),
        new MockFile('/b/c/e.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupLinks([
        new MockFile('/b/c/e.txt', '[](/a.md)'),
        new MockFile('/a.md', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to parent dirs', () => {
      setupLinks([
        new MockFile('/b/c/e.txt', '[](../../a.md)'),
        new MockFile('/a.md', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to subdirs', () => {
      setupLinks([
        new MockFile('/a/b.md', '[](c/d.txt)'),
        new MockFile('/a/c/d.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports non-note files', () => {
      setupLinks([
        new MockFile('/a/b.md', '[](c.png)'),
        new MockFile('/a/c.png', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('posix paths, wiki links', () => {
    if (process.platform === 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new MapLinkIndex();
      finder = new DeadLinkFinder(linkIndex, fileSystem.object);
    });

    it('finds dead link', () => {
      setupLinks([
        new MockFile('/a.md', '[[blah]]')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('blah');
    });

    it('finds no dead links', () => {
      setupLinks([
        new MockFile('/a.md', '[[b]]'),
        new MockFile('/b.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupLinks([
        new MockFile('/a.md', '[[e]]'),
        new MockFile('/b/c/e.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupLinks([
        new MockFile('/b/c/e.txt', '[[a]]'),
        new MockFile('/a.md', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('windows paths, markdown links', () => {
    if (process.platform !== 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new MapLinkIndex();
      finder = new DeadLinkFinder(linkIndex, fileSystem.object);
    });

    it('finds dead link', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[](c:\\b.txt)')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('c:\\a.md');
      expect(deadLinks[0].targetPath).toBe('c:\\b.txt');
    });

    it('finds no dead links', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[](c:\\b.txt)'),
        new MockFile('c:\\b.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[](c:\\b\\c\\e.txt)'),
        new MockFile('c:\\b\\c\\e.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupLinks([
        new MockFile('c:\\b\\c\\e.txt', '[](c:\\a.md)'),
        new MockFile('c:\\a.md', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to parent dirs', () => {
      setupLinks([
        new MockFile('c:\\b\\c\\e.txt', '[](..\\..\\a.md)'),
        new MockFile('c:\\a.md', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to subdirs', () => {
      setupLinks([
        new MockFile('c:\\a\\b.md', '[](c\\d.txt)'),
        new MockFile('c:\\a\\c\\d.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports non-note files', () => {
      setupLinks([
        new MockFile('c:\\a\\b.md', '[](c.png)'),
        new MockFile('c:\\a\\c.png', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('windows paths, wiki links', () => {
    if (process.platform !== 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new MapLinkIndex();
      finder = new DeadLinkFinder(linkIndex, fileSystem.object);
    });

    it('finds dead link', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[[blah]]')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('c:\\a.md');
      expect(deadLinks[0].targetPath).toBe('blah');
    });

    it('finds no dead links', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[[b]]'),
        new MockFile('c:\\b.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupLinks([
        new MockFile('c:\\a.md', '[[e]]'),
        new MockFile('c:\\b\\c\\e.txt', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupLinks([
        new MockFile('c:\\b\\c\\e.txt', '[[a]]'),
        new MockFile('c:\\a.md', '')
      ]);

      const deadLinks = finder.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });
});

describe('dead link finder, real filesystem', () => {
  let linkIndex: NoteIndex;
  let finder: DeadLinkFinder;

  beforeEach(() => {
    const fs = createFileSystem();
    linkIndex = new LunrNoteIndex(fs);
    finder = new DeadLinkFinder(linkIndex, fs);
  });

  it('finds dead markdown link in demo dir readme', async () => {
    await linkIndex.index(_path.resolve(__dirname, '../../demo_dir'));

    // act
    const deadLinks = finder.findAllDeadLinks();

    // assert
    expect(deadLinks).toHaveLength(2);

    const deadMarkdownLink = deadLinks
      .filter(d => d.targetPath.includes('to/nowhere'))[0];

    expect(deadMarkdownLink.sourcePath).toContain('readme.md');
  });

  it('finds dead wiki link in demo dir readme', async () => {
    await linkIndex.index(_path.resolve(__dirname, '../../demo_dir'));

    // act
    const deadLinks = finder.findAllDeadLinks();

    // assert
    expect(deadLinks).toHaveLength(2);

    const deadMarkdownLink = deadLinks
      .filter(d => d.targetPath.includes('non_existent_note'))[0];

    expect(deadMarkdownLink.sourcePath).toContain('readme.md');
  });
});
