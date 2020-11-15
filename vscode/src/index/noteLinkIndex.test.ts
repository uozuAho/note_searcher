import { MapLinkIndex } from "./noteLinkIndex";

describe('map link index', () => {
  describe('when a file is added', () => {
    let index: MapLinkIndex;
    const addedFile = process.platform === 'win32'
      ? 'C:\\a\\b.txt'
      : '/a/b.txt';

    beforeAll(() => {
      index = new MapLinkIndex();
      index.addFile(addedFile, 'a [link](to/thing) and a [[wiki link | to_filename]]');
    });

    it('indexes markdown links from files', () => {
      expect(index.markdownLinksFrom(addedFile)).toEqual(['to/thing']);
    });

    it('indexes wiki links from files', () => {
      expect(index.wikiLinksFrom(addedFile)).toEqual(['to_filename']);
    });

    it('indexes links to files', () => {
      if (process.platform === 'win32') {
        expect(index.linksTo('C:\\a\\to\\thing')).toEqual([addedFile]);
      } else {
        expect(index.linksTo('/a/to/thing')).toEqual([addedFile]);
      }
    });

    it('contains added file', () => {
      expect(index.containsNote(addedFile)).toBe(true);
      expect(Array.from(index.notes())).toEqual([addedFile]);
    });
  });

  describe('reset', () => {
    it('clears everything', () => {
      const index = new MapLinkIndex();
      const addedFile = '/a/b.txt';
      index.addFile(addedFile, 'a [link](to/thing)');

      index.clear();

      expect(index.containsNote(addedFile)).toBe(false);
      expect(Array.from(index.notes())).toHaveLength(0);
      expect(index.markdownLinksFrom(addedFile)).toHaveLength(0);
    });
  });

  it('does not index http links', () => {
    const index = new MapLinkIndex();
    const addedFile = '/a/b.txt';
    index.addFile('/a/b.txt', 'a [link](http://to/internet/stuff)');

    expect(index.markdownLinksFrom(addedFile)).toEqual([]);
    expect(index.containsNote(addedFile)).toBe(true);
    expect(Array.from(index.notes())).toEqual(['/a/b.txt']);
  });
});
