import * as tmoq from 'typemoq';

import { InMemoryLinkIndex } from "./InMemoryLinkIndex";
import { IFileSystem } from '../utils/IFileSystem';
import { IFile, SimpleFile } from '../utils/IFile';

describe('InMemoryLinkIndex, dead links, mocked filesystem', () => {
  let fileSystem: tmoq.IMock<IFileSystem>;
  let linkIndex: InMemoryLinkIndex;

  const setupFiles = (fileLinks: IFile[]) => {
    for (const file of fileLinks) {
      linkIndex.addFile(file.path(), file.text());
      fileSystem.setup(f => f.fileExists(file.path())).returns(() => true);
    }
    linkIndex.finalise();
  };

  describe('on file modified', () => {
    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<IFileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupFiles([
        new SimpleFile('/a.md', 'nothing here yet')
      ]);
      linkIndex.onFileModified('/a.md', 'this linked note doesnt exist: [[b]]');

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('b');
    });

    it('removes dead link', () => {
      setupFiles([
        new SimpleFile('/a.md', 'dead link to b: [[b]]')
      ]);
      linkIndex.onFileModified('/a.md', 'dead link removed');

      expect(linkIndex.findAllDeadLinks()).toHaveLength(0);
    });
  });

  describe('posix paths, markdown links', () => {
    if (process.platform === 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<IFileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupFiles([
        new SimpleFile('/a.md', '[](/b.txt)')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('/b.txt');
    });

    it('finds no dead links', () => {
      setupFiles([
        new SimpleFile('/a.md', '[](/b.txt)'),
        new SimpleFile('/b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupFiles([
        new SimpleFile('/a.md', '[](/b/c/e.txt)'),
        new SimpleFile('/b/c/e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupFiles([
        new SimpleFile('/b/c/e.txt', '[](/a.md)'),
        new SimpleFile('/a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to parent dirs', () => {
      setupFiles([
        new SimpleFile('/b/c/e.txt', '[](../../a.md)'),
        new SimpleFile('/a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to subdirs', () => {
      setupFiles([
        new SimpleFile('/a/b.md', '[](c/d.txt)'),
        new SimpleFile('/a/c/d.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports non-note files', () => {
      setupFiles([
        new SimpleFile('/a/b.md', '[](c.png)'),
        new SimpleFile('/a/c.png', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('posix paths, wiki links', () => {
    if (process.platform === 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<IFileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupFiles([
        new SimpleFile('/a.md', '[[blah]]')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('/a.md');
      expect(deadLinks[0].targetPath).toBe('blah');
    });

    it('finds no dead links', () => {
      setupFiles([
        new SimpleFile('/a.md', '[[b]]'),
        new SimpleFile('/b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupFiles([
        new SimpleFile('/a.md', '[[e]]'),
        new SimpleFile('/b/c/e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupFiles([
        new SimpleFile('/b/c/e.txt', '[[a]]'),
        new SimpleFile('/a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('windows paths, markdown links', () => {
    if (process.platform !== 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<IFileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupFiles([
        new SimpleFile('c:\\a.md', '[](c:\\b.txt)')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('c:\\a.md');
      expect(deadLinks[0].targetPath).toBe('c:\\b.txt');
    });

    it('finds no dead links', () => {
      setupFiles([
        new SimpleFile('c:\\a.md', '[](c:\\b.txt)'),
        new SimpleFile('c:\\b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupFiles([
        new SimpleFile('c:\\a.md', '[](c:\\b\\c\\e.txt)'),
        new SimpleFile('c:\\b\\c\\e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupFiles([
        new SimpleFile('c:\\b\\c\\e.txt', '[](c:\\a.md)'),
        new SimpleFile('c:\\a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to parent dirs', () => {
      setupFiles([
        new SimpleFile('c:\\b\\c\\e.txt', '[](..\\..\\a.md)'),
        new SimpleFile('c:\\a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports relative links to subdirs', () => {
      setupFiles([
        new SimpleFile('c:\\a\\b.md', '[](c\\d.txt)'),
        new SimpleFile('c:\\a\\c\\d.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('supports non-note files', () => {
      setupFiles([
        new SimpleFile('c:\\a\\b.md', '[](c.png)'),
        new SimpleFile('c:\\a\\c.png', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('windows paths, wiki links', () => {
    if (process.platform !== 'win32') { return; }

    beforeEach(() => {
      fileSystem = tmoq.Mock.ofType<IFileSystem>();
      linkIndex = new InMemoryLinkIndex();
    });

    it('finds dead link', () => {
      setupFiles([
        new SimpleFile('c:\\a.md', '[[blah]]')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(1);
      expect(deadLinks[0].sourcePath).toBe('c:\\a.md');
      expect(deadLinks[0].targetPath).toBe('blah');
    });

    it('finds no dead links', () => {
      setupFiles([
        new SimpleFile('c:\\a.md', '[[b]]'),
        new SimpleFile('c:\\b.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to subdirs work', () => {
      setupFiles([
        new SimpleFile('c:\\a.md', '[[e]]'),
        new SimpleFile('c:\\b\\c\\e.txt', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });

    it('links to parent dirs work', () => {
      setupFiles([
        new SimpleFile('c:\\b\\c\\e.txt', '[[a]]'),
        new SimpleFile('c:\\a.md', '')
      ]);

      const deadLinks = linkIndex.findAllDeadLinks();

      expect(deadLinks).toHaveLength(0);
    });
  });
});
