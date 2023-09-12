import { FullTextSearch } from './FullTextSearch';
import { LunrDualFts } from './lunrDualFts';
import { LunrFullTextSearch } from './lunrFullTextSearch';

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

describe.each([
  ['lunr', () => new LunrFullTextSearch()],
  ['lunr dual', () => new LunrDualFts()]
])('%s', (name, builder) => {
  let lunrSearch: FullTextSearch;

  const index = async (files: FileAndTags[]) => {
    lunrSearch = builder();
    for (const file of files) {
      await lunrSearch.indexFile(file.path, file.text, file.tags);
    }
  };

  const searchFor = async (query: string, text: string, tags: string[] = []) => {
    await index([new FileAndTags(aTextFilePath, text, tags)]);

    return lunrSearch.search(query);
  };

  const modifyFile = (file: FileAndTags) => {
    lunrSearch.onFileModified(file.path, file.text, file.tags);
  };

  beforeEach(() => {
    lunrSearch = new LunrFullTextSearch();
  });

  it('index and search example', async () => {
    await index([
      new FileAndTags('a/b.txt', 'blah blah some stuff and things'),
      new FileAndTags('a/b/c.log', 'what about shoes and biscuits'),
    ]);

    const results = await lunrSearch.search('blah');

    expect(results.length).toBe(1);
    expect(results[0]).toBe('a/b.txt');
  });

  // todo: unskip once dual index is implemented
  it('updates index after file is modified', async () => {
    await index([
      new FileAndTags('a/b.txt', 'blah blah some stuff and things'),
      new FileAndTags('a/b/c.log', 'what about shoes and biscuits'),
    ]);

    let results = await lunrSearch.search('blah');
    expect(results.length).toBe(1);

    const modified = new FileAndTags('a/b.txt', 'some stuff and things and more things');
    modifyFile(modified);

    results = await lunrSearch.search('blah');
    expect(results.length).toBe(0);
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

// todo: this should probably be somewhere else
describe('lunr search: expand query tags', () => {
  const lunrSearch = new LunrFullTextSearch();

  it('replaces tag at the start of a query', () => {
    const inputQuery = '#tag';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe('tags:tag');
  });

  it('replaces tag in the middle of a query', () => {
    const inputQuery = 'hello #tag boy';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe('hello tags:tag boy');
  });

  it('replaces multiple tags', () => {
    const inputQuery = 'hello #tag #boy';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe('hello tags:tag tags:boy');
  });

  it('does not replace non tag', () => {
    const inputQuery = 'this is no#t a tag';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe(inputQuery);
  });

  it('works with operators', () => {
    const inputQuery = 'dont include this -#tag';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe('dont include this -tags:tag');
  });
});
