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
  };

  describe('posix paths', () => {
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

  describe('windows paths', () => {
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
});

describe('dead link finder, real filesystem', () => {
  let linkIndex: NoteIndex;
  let finder: DeadLinkFinder;

  beforeEach(() => {
    const fs = createFileSystem();
    linkIndex = new LunrNoteIndex(fs);
    finder = new DeadLinkFinder(linkIndex, fs);
  });

  it('finds dead link in demo dir readme', async () => {
    await linkIndex.index(_path.resolve(__dirname, '../../demo_dir'));

    const deadLinks = finder.findAllDeadLinks();

    expect(deadLinks).toHaveLength(1);
    expect(deadLinks[0].sourcePath).toContain('readme.md');
    expect(deadLinks[0].targetPath).toContain('to/nowhere');
  });
});
