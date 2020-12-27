import * as tmoq from 'typemoq';

import { LunrNoteIndex } from "./lunrNoteIndex";
import { FileSystem } from "../utils/FileSystem";
import { File } from '../utils/File';
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


describe('lunr note index', () => {
  let fileSystem: tmoq.IMock<FileSystem>;
  let lunrNoteIndex: LunrNoteIndex;

  const setupFiles = (files: File[]) => {
    fileSystem.setup(w => w.allFilesUnderPath(tmoq.It.isAny()))
      .returns(() => files.map(f => f.path()));
    for (const file of files) {
      fileSystem.setup(f =>
        f.readFileAsync(file.path()))
        .returns(() => Promise.resolve(file.text()));
    }
  };

  const searchFor = async (query: string, text: string) => {
    setupFiles([new MockFile(aTextFilePath, text)]);

    await lunrNoteIndex.index('some dir');

    return lunrNoteIndex.search(query);
  };

  beforeEach(() => {
    fileSystem = tmoq.Mock.ofType<FileSystem>();
    lunrNoteIndex = new LunrNoteIndex(fileSystem.object);
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

      await lunrNoteIndex.index('some dir');

      expect(lunrNoteIndex.allTags()).toEqual(['tag', 'different']);
    });

    it('returns unique tags', async () => {
      setupFiles([
        new MockFile('a/b.txt', 'this has a #tag'),
        new MockFile('a/b/c.log', 'this has the same #tag'),
      ]);

      await lunrNoteIndex.index('some dir');

      expect(lunrNoteIndex.allTags()).toEqual(['tag']);
    });

    it('rebuilds on save', async () => {
      setupFiles([new MockFile('a/b.txt', 'this has a #tag')]);

      await lunrNoteIndex.index('some dir');

      expect(lunrNoteIndex.allTags()).toEqual(['tag']);

      setupFiles([new MockFile('a/b.txt', 'now there are no tags')]);

      await lunrNoteIndex.index('some dir');

      expect(lunrNoteIndex.allTags()).toEqual([]);
    });
  });

  describe('note index', () => {
    it('indexes all notes', async () => {
      const files = [
        new MockFile('a/b.txt', ''),
        new MockFile('a/b/c.log', ''),
      ];
      setupFiles(files);

      await lunrNoteIndex.index('some dir');

      const notes = Array.from(lunrNoteIndex.notes());
      expect(notes).toEqual(files.map(f => f.path()));
      expect(lunrNoteIndex.containsNote('a/b.txt')).toBe(true);
    });

    it('does not index non-text files', async () => {
      setupFiles([new MockFile('source_file.cpp', '')]);

      await lunrNoteIndex.index('some dir');

      const notes = Array.from(lunrNoteIndex.notes());
      expect(notes).toHaveLength(0);
      expect(lunrNoteIndex.containsNote('source_file.cpp')).toBe(false);
    });
  });

  describe('link index', () => {
    it('indexes markdown links', async () => {
      if (process.platform === 'win32') {
        setupFiles([new MockFile('C:\\a\\b.txt', '[a link](to/some/stuff)')]);
      } else {
        setupFiles([new MockFile('/a/b.txt', '[a link](to/some/stuff)')]);
      }

      await lunrNoteIndex.index('some dir');

      if (process.platform === 'win32') {
        const links = lunrNoteIndex.linksFrom('C:\\a\\b.txt');
        expect(links).toEqual(['C:\\a\\to\\some\\stuff']);
      } else {
        const links = lunrNoteIndex.linksFrom('/a/b.txt');
        expect(links).toEqual(['/a/to/some/stuff']);
      }
    });
  });
});
