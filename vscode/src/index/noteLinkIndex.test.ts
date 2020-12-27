import { MapLinkIndex } from "./noteLinkIndex";

describe('map link index', () => {
  describe('when a file is added', () => {
    let index: MapLinkIndex;
    const note1 = process.platform === 'win32' ? 'C:\\a\\note1.md' : '/a/note1.md';
    const note2 = process.platform === 'win32' ? 'C:\\a\\note2.md' : '/a/note2.md';

    beforeAll(() => {
      index = new MapLinkIndex();
      index.addFile(note1, 'a [link](note2.md) and a [[wiki link | note2]]');
      index.addFile(note2, 'blah blah note2 has no links');
      index.buildBacklinkIndex();
    });

    it('indexes markdown links from notes', () => {
      expect(index.markdownLinksFrom(note1)).toEqual(['note2.md']);
    });

    it('indexes wiki links from notes', () => {
      expect(index.wikiLinksFrom(note1)).toEqual(['note2']);
    });

    it('indexes links to notes', () => {
      if (process.platform === 'win32') {
        expect(index.linksTo('C:\\a\\note2.md')).toEqual([note1]);
        // expect(index.linksTo('to_filename')).toEqual([addedFile]);
      } else {
        expect(index.linksTo('/a/note2.md')).toEqual([note1]);
        // expect(index.linksTo('to_filename')).toEqual([addedFile]);
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
      index.buildBacklinkIndex();

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
