import { InMemFileSystem } from '../utils/InMemFileSystem';
import { IFullTextSearch } from './IFullTextSearch';
import { LunrDualFts } from './lunrDualFts';

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
    fts = new LunrDualFts(fakeFs);
    for (const file of files) {
      await fts.addFile(file.path, file.text, file.tags);
      fakeFs.writeFile(file.path, file.text);
    }
  };

  const searchFor = async (query: string, text: string, tags: string[] = []) => {
    await index([new FileAndTags(aTextFilePath, text, tags)]);

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
    fts = new LunrDualFts(fakeFs);
  });

  it('index and search example', async () => {
    await index([
      new FileAndTags('a/b.txt', 'blah blah some stuff and things'),
      new FileAndTags('a/b/c.log', 'what about shoes and biscuits'),
    ]);

    const results = await fts.search('blah');

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

    let modified = new FileAndTags('one.blah.md', 'most blah! blah blah blah blah');
    await modifyFile(modified);

    const results = await fts.search('blah');

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

  // note: lunr doesn't have an AND operator
  describe('plus operator', () => {
    it('finds multiple words', async () => {
      await expect(searchFor("+ham +good", "the ham is good")).toBeFound();
    });

    it('rejects any missing words', async () => {
      await expect(searchFor("+ham +pizza", "the ham is good")).not.toBeFound();
    });
  });

  describe('not operator', () => {
    it('finds word when excluded word is missing', async () => {
      await expect(searchFor("ham -pizza", "the ham is good")).toBeFound();
    });

    it('does not find when excluded word is present', async () => {
      await expect(searchFor("ham -good", "the ham is good")).not.toBeFound();
    });
  });

  // lunr doesn't support exact phrase matching: https://github.com/olivernn/lunr.js/issues/62
  describe('phrases', () => {
    it('does not support phrases', async () => {
      await expect(searchFor('"ham is good"', "the ham is good")).not.toBeFound();
    });
  });

  describe('search with tags', () => {
    it('finds single tag', async () => {
      await expect(searchFor("#beef", "The tags are", ['beef', 'chowder'])).toBeFound();
    });

    it('finds multiple tags', async () => {
      await expect(searchFor("#beef #chowder", "The tags are", ['beef', 'chowder'])).toBeFound();
    });

    it('does not find missing tag', async () => {
      await expect(searchFor("#asdf", "The tags are", ['beef', 'chowder'])).not.toBeFound();
    });

    it('does not find non tag', async () => {
      await expect(searchFor("#tags", "The tags are", ['beef', 'chowder'])).not.toBeFound();
    });

    it('works with operators', async () => {
      await expect(searchFor("#beef -#chowder", "The tags are", ['beef', 'chowder'])).not.toBeFound();
    });

    it('supports hyphenated tags', async () => {
      await expect(searchFor("#meat-pie", "I want a", ['meat-pie'])).toBeFound();
      await expect(searchFor("#meat-pie", "I want a", ['meat'])).not.toBeFound();
      await expect(searchFor("#meat", "I want a", ['meat-pie'])).not.toBeFound();
    });
  });
});
