import { InMemFileSystem } from '../utils/InMemFileSystem';
import { IFullTextSearch } from './IFullTextSearch';
import { MyFts } from './myFts';

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
        message: () => `returned no results`,
        pass: false
      };
  }
});

class FileAndTags {
  constructor(
    public path: string,
    public text: string,
    public tags: string[] = []
  ) {}
}

let fakeFs: InMemFileSystem;

describe('full text search', () => {
  let fts: IFullTextSearch;

  const index = async (files: FileAndTags[]) => {
    for (const file of files) {
      fakeFs.writeFile(file.path, file.text);
    }
  };

  const searchFor = async (query: string, text: string, tags: string[] = []) => {
    fakeFs.writeFile("/some/path.txt", text);
    return fts.search(query);
  };

  const modifyFile = async (file: FileAndTags) => {
    fakeFs.writeFile(file.path, file.text);
    await fts.onFileModified(file.path, file.text, file.tags);
  };

  const deleteFile = async (path: string) => {
    fakeFs.deleteFile(path);
    return fts.onFileDeleted(path);
  };

  beforeEach(() => {
    fakeFs = new InMemFileSystem();
    fts = new MyFts(fakeFs, "");
  });

  it('index and search example', async () => {
    await index([
      new FileAndTags('blah.txt', 'blah blah stuff'),
      new FileAndTags('shoe.log', 'shoes and stuff'),
    ]);

    expect(await fts.search('blah')).toEqual(['blah.txt']);
    expect(await fts.search('stuff')).toEqual(['blah.txt', 'shoe.log']);
    expect(await fts.search('stuff -shoe')).toEqual(['blah.txt']);
    expect(await fts.search('shoe')).toEqual(['shoe.log']);
    expect(await fts.search('shoe')).toEqual(['shoe.log']);
    expect(await fts.search('+shoe')).toEqual(['shoe.log']);
  });

  it('is case insensitive', async () => {
    await expect(searchFor("ham", "the Ham is good")).toBeFound();
  });

  it('findsSingleWord', async () => {
    await expect(searchFor("ham", "the ham is good")).toBeFound();
  });

  it('doesNotFindMissingWord', async () => {
    await expect(searchFor("pizza", "the ham is good")).not.toBeFound();
  });

  it('does not match substrings', async () => {
    await expect(searchFor("board", "onboarding")).not.toBeFound();
    await expect(searchFor("board", "boardahol")).not.toBeFound();
    await expect(searchFor("board", "wackyboard")).not.toBeFound();
  });

  it('finds word before slash', async () => {
    await expect(searchFor("red", "red/green/refactor")).toBeFound();
  });

  it('finds after slash', async () => {
    await expect(searchFor("refactor", "red/green/refactor")).toBeFound();
  });

  it('updates index after file is modified', async () => {
    await index([
      new FileAndTags('a/b.txt', 'blah blah some stuff and things'),
      new FileAndTags('a/b/c.log', 'what about shoes and biscuits'),
    ]);

    let results = await fts.search('blah');
    expect(results.length).toBe(1);

    let modified = new FileAndTags('a/b.txt', 'some stuff and things and more things');
    await modifyFile(modified);

    results = await fts.search('blah');
    expect(results.length).toBe(0);

    modified = new FileAndTags('a/b.txt', 'ok blah is back');
    await modifyFile(modified);

    results = await fts.search('blah');
    expect(results.length).toBe(1);

    modified = new FileAndTags('a/b/c.log', 'blah now both notes contain blah');
    await modifyFile(modified);

    results = await fts.search('blah');
    expect(results.length).toBe(2);
  });

  it('orders search results by relevance', async () => {
    await index([
      new FileAndTags('lots.of.blah.txt', 'blah blah blah'),
      new FileAndTags('one.blah.md', 'blah'),
      new FileAndTags('medium.blah.log', 'blah blah'),
    ]);

    let results = await fts.search('blah');

    expect(results).toStrictEqual([
      'lots.of.blah.txt',
      'medium.blah.log',
      'one.blah.md'
    ]);
  });

  it('orders search results by relevance, after modification', async () => {
    await index([
      new FileAndTags('lots.of.blah.txt', 'blah blah blah'),
      new FileAndTags('medium.blah.log', 'blah blah'),
      new FileAndTags('one.blah.md', 'blah'),
    ]);

    let modified = new FileAndTags('one.blah.md', 'turnip');
    await modifyFile(modified);

    const results = await fts.search('blah turnip');

    expect(results).toStrictEqual([
      'one.blah.md',
      'lots.of.blah.txt',
      'medium.blah.log',
    ]);
  });

  it('finds file after it was deleted and recreated', async () => {
    await index([
      new FileAndTags('a/b.txt', 'blah blah some stuff and things'),
      new FileAndTags('a/b/c.log', 'what about shoes and biscuits'),
    ]);

    await deleteFile('a/b.txt');

    let results = await fts.search('blah');
    expect(results).toHaveLength(0);

    const modified = new FileAndTags('a/b.txt', 'ok blah is back');
    await modifyFile(modified);

    results = await fts.search('blah');
    expect(results.length).toBe(1);
  });

  it('does not find file after it was modified then deleted', async () => {
    await index([
      new FileAndTags('a/b.txt', 'blah blah some stuff and things'),
      new FileAndTags('a/b/c.log', 'what about shoes and biscuits'),
    ]);

    const modified = new FileAndTags('a/b.txt', 'modified blah blah');
    await modifyFile(modified);
    await deleteFile('a/b.txt');

    let results = await fts.search('blah');
    expect(results).toHaveLength(0);
  });

  describe('markdown links', () => {
    it('finds single word', async () => {
      await expect(searchFor("bike", "I have a [bike](a/b/c)")).toBeFound();
    });

    it('finds first word', async () => {
      await expect(searchFor("ham", "I have a [ham bike](a/b/c)")).toBeFound();
    });

    it('finds middle word', async () => {
      await expect(searchFor("ham", "I have a [super ham bike](a/b/c)")).toBeFound();
    });

    it('finds last word', async () => {
      await expect(searchFor("bike", "I have a [ham bike](a/b/c)")).toBeFound();
    });
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

  describe('plus operator', () => {
    it('finds multiple words', async () => {
      await expect(searchFor("+ham +good", "the ham is good")).toBeFound();
    });

    it('rejects any missing words', async () => {
      await expect(searchFor("+ham +pizza", "the ham is good")).not.toBeFound();
    });

    it('does not match substrings+', async () => {
      await expect(searchFor("+board", "onboarding")).not.toBeFound();
      await expect(searchFor("+board", "boardahol")).not.toBeFound();
      await expect(searchFor("+board", "wackyboard")).not.toBeFound();
    });
  });

  describe('not operator', () => {
    it('finds word when excluded word is missing', async () => {
      await expect(searchFor("ham -pizza", "the ham is good")).toBeFound();
    });

    it('does not find when excluded word is present', async () => {
      await expect(searchFor("ham -good", "the ham is good")).not.toBeFound();
    });

    it('does not match substrings-', async () => {
      await expect(searchFor("beach -ham", "beach nottingham")).toBeFound();
    });
  });

  describe('stemming', () => {
    it('basic stem', async () => {
      await expect(searchFor("bike", "I own several bikes")).toBeFound();
    });

    it('basic stem+', async () => {
      await expect(searchFor("+bike", "I own several bikes")).toBeFound();
    });

    it('basic stem-', async () => {
      await expect(searchFor("-bike", "I own several bikes")).not.toBeFound();
    });

    it.each([
      ['cat', ['cats'], ['catermaran']],
      ['house', ['housing', 'houses'], []],
      ['brief', ['briefly'], []],
      ['run', ['running', 'runner'], ['rung']],
    ])('', async (word, shouldFind, shouldNotFind) => {
      for (const x of shouldFind) {
        try {
          await expect(searchFor(word, x)).toBeFound();
        } catch (err) {
          throw new Error(`looking for word "${word}" in "${x}": ${err}`);
        }
      }
      for (const x of shouldNotFind) {
        try {
          await expect(searchFor(word, x)).not.toBeFound();
        } catch (err) {
          throw new Error(`looking for word "${word}" in "${x}": ${err}`);
        }
      }
    });
  });
});
