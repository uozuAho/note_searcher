import * as tmoq from 'typemoq';

import { LunrSearch } from "./lunrSearch";
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


describe('lunr search', () => {
  let fileSystem: tmoq.IMock<FileSystem>;
  let lunrSearcher: LunrSearch;

  const setupFiles = (files: File[]) => {
    fileSystem.setup(w => w.allFilesUnderPath(tmoq.It.isAny()))
      .returns(() => files.map(f => f.path()));
    for (const file of files) {
      fileSystem.setup(r => r.readFile(file.path())).returns(() => file.text());
    }
  };

  const searchFor = (query: string, text: string) => {
    setupFiles([new MockFile(aTextFilePath, text)]);

    lunrSearcher.index('some dir');

    return lunrSearcher.search(query);
  };

  beforeEach(() => {
    fileSystem = tmoq.Mock.ofType<FileSystem>();
    lunrSearcher = new LunrSearch(fileSystem.object);
  });

  it('index and search example', async () => {
    setupFiles([
      new MockFile('a/b.txt', 'blah blah some stuff and things'),
      new MockFile('a/b/c.log', 'what about shoes and biscuits'),
    ]);

    lunrSearcher.index('some dir');
    const results = await lunrSearcher.search('blah');

    expect(results.length).toBe(1);
    expect(results[0]).toBe('a/b.txt');
  });

  it('findsSingleWord', async () => {
    await expect(searchFor("ham", "the ham is good")).toBeFound();
  });

  it('doesNotFindMissingWord', async () => {
    await expect(searchFor("pizza", "the ham is good")).not.toBeFound();
  });

  it('findsStemmedWord', async () => {
    await expect(searchFor("bike", "I own several bikes")).toBeFound();
  });

  describe('or operator', () => {
    it('isDefault', async () => {
      await expect(searchFor("ham good", "the ham is good")).toBeFound();
      await expect(searchFor("ham or good", "the ham is good")).toBeFound();
    });

    it('findsAtLeastOnePresentWord', async () => {
      await expect(searchFor("ham jabberwocky turtle house cannon", "the ham is good")).toBeFound();
    });
  });

  // note: lunr doesn't have an AND operator
  describe('plus operator', () => {
    it('finds multiple words', async () => {
      await expect(searchFor("+ham +good", "the ham is good")).toBeFound();
    });

    it('rejects any missing words', async () => {
      await expect(searchFor("+ham +pizza", "the ham is good")).not.toBeFound();
    });
  });
});
