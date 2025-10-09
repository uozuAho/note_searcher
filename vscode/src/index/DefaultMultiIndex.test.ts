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

  const searchFor = async (query: string, text: string) => {
    setupFiles([new SimpleFile('path.txt', text)]);

    await index.indexAllFiles('some dir');

    return index.fullTextSearch(query);
  };

  beforeEach(() => {
    fileSystem = InMemFileSystem.createEmpty();
    const ignoredWorkspaceDir = '';
    index = new DefaultMultiIndex(fileSystem, ignoredWorkspaceDir);
  });

  describe('search with tags', () => {
    it('finds single tag', async () => {
      await expect(searchFor("#beef", "The tags are #beef and #chowder")).toBeFound();
    });

    it('finds multiple tags', async () => {
      await expect(searchFor("#beef #chowder", "The tags are #beef and #chowder")).toBeFound();
    });

    it('does not find missing tag', async () => {
      await expect(searchFor("#asdf", "The tags are #beef and #chowder")).not.toBeFound();
    });

    it('does not find non tag', async () => {
      await expect(searchFor("#tags", "The tags are #beef and #chowder")).not.toBeFound();
    });

    it('works with operators', async () => {
      await expect(searchFor("#beef -#chowder", "The tags are #beef and #chowder")).not.toBeFound();
    });

    it('supports hyphenated tags', async () => {
      await expect(searchFor("#meat-pie", "I want a #meat-pie")).toBeFound();
      await expect(searchFor("#meat-pie", "I want a #meat")).not.toBeFound();
      await expect(searchFor("#meat", "I want a #meat-pie")).not.toBeFound();
    });
  });

  describe('allTags', () => {
    it('returns all tags', async () => {
      setupFiles([
        new SimpleFile('a/b.txt', 'this has a #tag'),
        new SimpleFile('a/b/c.log', 'this has a #different tag'),
      ]);

      await index.indexAllFiles('some dir');

      expect(index.allTags()).toEqual(['tag', 'different']);
    });

    it('returns unique tags', async () => {
      setupFiles([
        new SimpleFile('a/b.txt', 'this has a #tag'),
        new SimpleFile('a/b/c.log', 'this has the same #tag'),
      ]);

      await index.indexAllFiles('some dir');

      expect(index.allTags()).toEqual(['tag']);
    });

    it('does not clear tags on save', async () => {
      setupFiles([new SimpleFile('a/b.txt', 'this has a #tag')]);

      await index.indexAllFiles('some dir');

      expect(index.allTags()).toEqual(['tag']);

      await index.onFileModified('a/b.txt', 'now there are no tags');

      // This is expected behaviour. I don't want to re-index the whole
      // workspace, so potentially old tags may remain.
      expect(index.allTags()).toEqual(['tag']);
    });

    it('adds new tags on save', async () => {
      setupFiles([new SimpleFile('a/b.txt', 'this has a #tag')]);

      await index.indexAllFiles('some dir');

      expect(index.allTags()).toEqual(['tag']);

      await index.onFileModified('a/b.txt', '#another tag');

      expect(index.allTags()).toEqual(['tag', 'another']);
    });
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
