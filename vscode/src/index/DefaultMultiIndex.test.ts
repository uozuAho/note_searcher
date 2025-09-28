import * as tmoq from 'typemoq';

import { DefaultMultiIndex } from "./DefaultMultiIndex";
import { FileSystem } from "../utils/FileSystem";
import { IFile } from '../utils/IFile';
import { MockFile } from '../mocks/MockFile';

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

const aTextFilePath = '/a/b/c.txt';


describe('DefaultMultiIndex, mocked filesystem', () => {
  let fileSystem: tmoq.IMock<FileSystem>;
  let index: DefaultMultiIndex;

  const setupFiles = (files: IFile[]) => {
    fileSystem.setup(w => w.allFilesUnderPath(tmoq.It.isAny(), tmoq.It.isAny()))
      .returns(() => files.map(f => f.path()));
    for (const file of files) {
      fileSystem.setup(f =>
        f.readFileAsync(file.path()))
        .returns(() => Promise.resolve(file.text()));
    }
  };

  const searchFor = async (query: string, text: string) => {
    setupFiles([new MockFile(aTextFilePath, text)]);

    await index.indexAllFiles('some dir');

    return index.fullTextSearch(query);
  };

  beforeEach(() => {
    fileSystem = tmoq.Mock.ofType<FileSystem>();
    const ignoredWorkspaceDir = '';
    index = new DefaultMultiIndex(fileSystem.object, ignoredWorkspaceDir);
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
        new MockFile('a/b.txt', 'this has a #tag'),
        new MockFile('a/b/c.log', 'this has a #different tag'),
      ]);

      await index.indexAllFiles('some dir');

      expect(index.allTags()).toEqual(['tag', 'different']);
    });

    it('returns unique tags', async () => {
      setupFiles([
        new MockFile('a/b.txt', 'this has a #tag'),
        new MockFile('a/b/c.log', 'this has the same #tag'),
      ]);

      await index.indexAllFiles('some dir');

      expect(index.allTags()).toEqual(['tag']);
    });

    it('does not clear tags on save', async () => {
      setupFiles([new MockFile('a/b.txt', 'this has a #tag')]);

      await index.indexAllFiles('some dir');

      expect(index.allTags()).toEqual(['tag']);

      await index.onFileModified('a/b.txt', 'now there are no tags');

      // This is expected behaviour. I don't want to re-index the whole
      // workspace, so potentially old tags may remain.
      expect(index.allTags()).toEqual(['tag']);
    });

    it('adds new tags on save', async () => {
      setupFiles([new MockFile('a/b.txt', 'this has a #tag')]);

      await index.indexAllFiles('some dir');

      expect(index.allTags()).toEqual(['tag']);

      await index.onFileModified('a/b.txt', '#another tag');

      expect(index.allTags()).toEqual(['tag', 'another']);
    });
  });

  describe('note index', () => {
    it('indexes all notes', async () => {
      const files = [
        new MockFile('a/b.txt', ''),
        new MockFile('a/b/c.log', ''),
      ];
      setupFiles(files);

      await index.indexAllFiles('some dir');

      const notes = Array.from(index.notes());
      expect(notes).toEqual(files.map(f => f.path()));
      expect(index.containsNote('a/b.txt')).toBe(true);
    });

    it('does not index non-text files', async () => {
      setupFiles([new MockFile('source_file.cpp', '')]);

      await index.indexAllFiles('some dir');

      const notes = Array.from(index.notes());
      expect(notes).toHaveLength(0);
      expect(index.containsNote('source_file.cpp')).toBe(false);
    });
  });
});
