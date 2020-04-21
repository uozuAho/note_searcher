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
  async toBeFound(received: Promise<string[]>) {
    return (await received).length > 0
      ? {
        message: () => '',
        pass: true
      }
      : {
        message: () => 'returned no results',
        pass: false
      };
  }
});


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
    setupFiles([new MockFile('some/path', text)]);

    lunrSearcher.index('some dir');

    return lunrSearcher.search(query);
  };

  beforeEach(() => {
    fileSystem = tmoq.Mock.ofType<FileSystem>();
    lunrSearcher = new LunrSearch(fileSystem.object);
  });

  it('index and search example', async () => {
    setupFiles([
      new MockFile('a/b', 'blah blah some stuff and things'),
      new MockFile('a/b/c', 'what about shoes and biscuits'),
    ]);

    lunrSearcher.index('some dir');
    const results = await lunrSearcher.search('blah');

    expect(results.length).toBe(1);
    expect(results[0]).toBe('a/b');
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
});
