import { DefaultMultiIndex } from "./DefaultMultiIndex";
import { IFile, SimpleFile } from '../utils/IFile';
import { InMemFileSystem } from '../utils/InMemFileSystem';

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeFound: (results: R) => Promise<T>;
    }
  }
}

expect.extend({
  async toBeFound(receivedPromise: Promise<string[]>) {
    const received = await receivedPromise;
    return received.length > 0
      ? {
        message: () => `expected no results, but found ${received.length}`,
        pass: true
      }
      : {
        message: () => 'returned no results',
        pass: false
      };
  }
});

describe('DefaultMultiIndex, mocked filesystem', () => {
  let fileSystem: InMemFileSystem;
  let index: DefaultMultiIndex;

  const setupFiles = (files: IFile[]) => {
    for (const file of files) {
      fileSystem.writeFile(file.path(), file.text());
    }
  };

  beforeEach(() => {
    fileSystem = InMemFileSystem.createEmpty();
    const ignoredWorkspaceDir = '';
    index = new DefaultMultiIndex(fileSystem, ignoredWorkspaceDir);
  });

  describe('note index', () => {
    it('indexes all notes', async () => {
      const files = [
        new SimpleFile('a/b.txt', ''),
        new SimpleFile('a/b/c.log', ''),
      ];
      setupFiles(files);

      await index.indexAllFiles('');

      const notes = Array.from(index.notes());
      expect(notes).toEqual(files.map(f => f.path()));
      expect(index.containsNote('a/b.txt')).toBe(true);
    });

    it('does not index non-text files', async () => {
      setupFiles([new SimpleFile('source_file.cpp', '')]);

      await index.indexAllFiles('');

      const notes = Array.from(index.notes());
      expect(notes).toHaveLength(0);
      expect(index.containsNote('source_file.cpp')).toBe(false);
    });
  });
});
