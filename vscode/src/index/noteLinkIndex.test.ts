import { MapLinkIndex } from "./noteLinkIndex";

describe('map link index', () => {
  describe('when a file is added', () => {
    let index: MapLinkIndex;
    const addedFile = '/a/b.txt';

    beforeAll(() => {
      index = new MapLinkIndex();
      index.addFile('/a/b.txt', 'a [link](to/thing)');
    });

    it('extracts links from files', () => {
      expect(index.linksFrom(addedFile)).toEqual(['to/thing']);
    });

    it('contains added file', () => {
      expect(index.containsFile(addedFile)).toBe(true);
      expect(Array.from(index.files())).toEqual(['/a/b.txt']);
    });
  });

  describe('reset', () => {
    it('clears everything', () => {
      const index = new MapLinkIndex();
      const addedFile = '/a/b.txt';
      index.addFile(addedFile, 'a [link](to/thing)');

      index.reset();

      expect(index.containsFile(addedFile)).toBe(false);
      expect(Array.from(index.files())).toHaveLength(0);
      expect(index.linksFrom(addedFile)).toHaveLength(0);
    });
  });

  it('does not index http links', () => {
    const index = new MapLinkIndex();
    const addedFile = '/a/b.txt';
    index.addFile('/a/b.txt', 'a [link](http://to/internet/stuff)');

    expect(index.linksFrom(addedFile)).toEqual([]);
    expect(index.containsFile(addedFile)).toBe(true);
    expect(Array.from(index.files())).toEqual(['/a/b.txt']);
  });
});
