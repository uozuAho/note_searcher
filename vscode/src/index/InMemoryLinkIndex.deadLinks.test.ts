import * as tmoq from 'typemoq';

import { InMemoryLinkIndex } from "./InMemoryLinkIndex";
import { MockFile } from "../mocks/MockFile";
import { FileSystem } from "../utils/FileSystem";

describe('InMemoryLinkIndex, dead links, mocked filesystem', () => {
  let fileSystem: tmoq.IMock<FileSystem>;
  let linkIndex: InMemoryLinkIndex;

  const setupFiles = (fileLinks: MockFile[]) => {
    for (const file of fileLinks) {
      linkIndex.addFile(file.path(), file.text());
      fileSystem.setup(f => f.fileExists(file.path())).returns(() => true);
    }
    linkIndex.finalise();
  };

  describe('on file modified', () => {
    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupFiles([
        new MockFile('/a.md', 'nothing here yet')
      ]);
      linkIndex.onFileModified('/a.md', 'this linked note doesnt exist: [[b]]');

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('b');
    });

    it('removes dead link', () => {
      setupFiles([
        new MockFile('/a.md', 'dead link to b: [[b]]')
      ]);
      linkIndex.onFileModified('/a.md', 'dead link removed');

      expect(linkIndex.findAllDeadLinks()).toHaveLength(0);
    });
  });

  describe('posix paths, markdown links', () => {
    if (process.platform === 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<FileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupFiles([
        new MockFile('/a.md', '[](/b.txt)')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('/b.txt');
    });

    it('finds no dead links', () => {
      setupFiles([
        new MockFile('/a.md', '[](/b.txt)'),
        new MockFile('/b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupFiles([
        new MockFile('/a.md', '[](/b/c/e.txt)'),
        new MockFile('/b/c/e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupFiles([
        new MockFile('/b/c/e.txt', '[](/a.md)'),
        new MockFile('/a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to parent dirs', () => {
      setupFiles([
        new MockFile('/b/c/e.txt', '[](../../a.md)'),
        new MockFile('/a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to subdirs', () => {
      setupFiles([
        new MockFile('/a/b.md', '[](c/d.txt)'),
        new MockFile('/a/c/d.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports non-note files', () => {
      setupFiles([
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
      setupFiles([
        new MockFile('/a.md', '[[blah]]')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('blah');
    });

    it('finds no dead links', () => {
      setupFiles([
        new MockFile('/a.md', '[[b]]'),
        new MockFile('/b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupFiles([
        new MockFile('/a.md', '[[e]]'),
        new MockFile('/b/c/e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupFiles([
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
      setupFiles([
        new MockFile('c:\\a.md', '[](c:\\b.txt)')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('c:\\a.md');
      expect(deadLinks[0].targetPath).toBe('c:\\b.txt');
    });

    it('finds no dead links', () => {
      setupFiles([
        new MockFile('c:\\a.md', '[](c:\\b.txt)'),
        new MockFile('c:\\b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupFiles([
        new MockFile('c:\\a.md', '[](c:\\b\\c\\e.txt)'),
        new MockFile('c:\\b\\c\\e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupFiles([
        new MockFile('c:\\b\\c\\e.txt', '[](c:\\a.md)'),
        new MockFile('c:\\a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to parent dirs', () => {
      setupFiles([
        new MockFile('c:\\b\\c\\e.txt', '[](..\\..\\a.md)'),
        new MockFile('c:\\a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to subdirs', () => {
      setupFiles([
        new MockFile('c:\\a\\b.md', '[](c\\d.txt)'),
        new MockFile('c:\\a\\c\\d.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports non-note files', () => {
      setupFiles([
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
      setupFiles([
        new MockFile('c:\\a.md', '[[blah]]')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('c:\\a.md');
      expect(deadLinks[0].targetPath).toBe('blah');
    });

    it('finds no dead links', () => {
      setupFiles([
        new MockFile('c:\\a.md', '[[b]]'),
        new MockFile('c:\\b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupFiles([
        new MockFile('c:\\a.md', '[[e]]'),
        new MockFile('c:\\b\\c\\e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupFiles([
        new MockFile('c:\\b\\c\\e.txt', '[[a]]'),
        new MockFile('c:\\a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });
});
