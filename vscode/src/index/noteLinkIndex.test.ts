import { MapLinkIndex } from "./noteLinkIndex";

describe('map link index', () => {
  describe('when a file is added', () => {
    let index: MapLinkIndex;
    const note1 = process.platform === 'win32' ? 'C:\\a\\note1.md' : '/a/note1.md';
    const note2 = process.platform === 'win32' ? 'C:\\a\\note2.md' : '/a/note2.md';

    beforeAll(() => {
      index = new MapLinkIndex();
      index.addFile(note1, 'has a markdown link: [link](note2.md)');
      index.addFile(note2, 'has a wiki link: [[link | note1]]');
      index.finalise();
    });

    it('indexes markdown links from notes', () => {
      expect(index.linksFrom(note1)).toEqual([note2]);
    });

    it('indexes wiki links from notes', () => {
      expect(index.linksFrom(note2)).toEqual([note1]);
    });

    it('indexes incoming markdown links', () => {
      if (process.platform === 'win32') {
        expect(index.linksTo('C:\\a\\note2.md')).toEqual([note1]);
      } else {
        expect(index.linksTo('/a/note2.md')).toEqual([note1]);
      }
    });

    it('indexes incoming wiki links', () => {
      if (process.platform === 'win32') {
        expect(index.linksTo('C:\\a\\note1.md')).toEqual([note2]);
      } else {
        expect(index.linksTo('/a/note1.md')).toEqual([note2]);
      }
    });

    it('contains added notes', () => {
      expect(index.containsNote(note1)).toBe(true);
      expect(Array.from(index.notes())).toEqual([note1, note2]);
    });
  });

  describe('reset', () => {
    it('clears everything', () => {
      const index = new MapLinkIndex();
      const addedFile = '/a/b.txt';
      index.addFile(addedFile, 'a [link](to/thing)');
      index.finalise();

      index.clear();

      expect(index.containsNote(addedFile)).toBe(false);
      expect(Array.from(index.notes())).toHaveLength(0);
      expect(index.linksFrom(addedFile)).toHaveLength(0);
    });
  });

  it('does not index http links', () => {
    const index = new MapLinkIndex();
    const addedFile = '/a/b.txt';
    index.addFile('/a/b.txt', 'a [link](http://to/internet/stuff)');

    expect(index.linksFrom(addedFile)).toEqual([]);
    expect(index.containsNote(addedFile)).toBe(true);
    expect(Array.from(index.notes())).toEqual(['/a/b.txt']);
  });
});
