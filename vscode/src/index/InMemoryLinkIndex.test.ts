import { InMemoryLinkIndex } from "./InMemoryLinkIndex";
import { Link } from "./LinkIndex";

describe('InMemoryLinkIndex, mocked filesystem', () => {
  describe('when a file is added', () => {
    let index: InMemoryLinkIndex;
    const note1 = process.platform === 'win32' ? 'C:\\a\\note1.md' : '/a/note1.md';
    const note2 = process.platform === 'win32' ? 'C:\\a\\note2.md' : '/a/note2.md';

    beforeAll(() => {
      index = new InMemoryLinkIndex();
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

    it('converts note filenames to absolute paths', () => {
      expect(index.filenameToAbsPath('note1')).toEqual([note1]);
      expect(index.filenameToAbsPath('note2')).toEqual([note2]);
    });
  });

  describe('when a file is modified', () => {
    let index: InMemoryLinkIndex;
    const note1 = process.platform === 'win32' ? 'C:\\a\\note1.md' : '/a/note1.md';
    const note2 = process.platform === 'win32' ? 'C:\\a\\note2.md' : '/a/note2.md';

    beforeAll(() => {
      index = new InMemoryLinkIndex();
      index.addFile(note1, 'has a markdown link: [link](note2.md)');
      index.addFile(note2, 'has a wiki link: [[link | note1]]');
      index.finalise();
    });

    it('removes links', () => {
      index.onFileModified(note1, 'I removed the link to note2');
      expect(index.linksFrom(note1)).toEqual([]);
      expect(index.linksTo(note2)).toEqual([]);
    });

    it('adds links', () => {
      index.onFileModified(note1, 'I removed the link to note2');
      index.onFileModified(note1, 'then put it back: [[note2]]');
      expect(index.linksFrom(note1)).toEqual([note2]);
      expect(index.linksTo(note2)).toEqual([note1]);
    });
  });

  describe('when a file is deleted', () => {
    let index: InMemoryLinkIndex;
    const note1 = process.platform === 'win32' ? 'C:\\a\\note1.md' : '/a/note1.md';
    const note2 = process.platform === 'win32' ? 'C:\\a\\note2.md' : '/a/note2.md';

    beforeAll(() => {
      index = new InMemoryLinkIndex();
      index.addFile(note1, 'has a markdown link: [link](note2.md)');
      index.addFile(note2, 'has a wiki link: [[link | note1]]');
      index.finalise();
      index.onFileDeleted(note1);
    });

    it('removes links', () => {
      expect(index.linksTo(note2)).toEqual([]);
      expect(index.linksFrom(note1)).toEqual([]);
    });
  });

  describe('when a file is moved', () => {
    let index: InMemoryLinkIndex;
    const note1 = process.platform === 'win32' ? 'C:\\a\\note1.md' : '/a/note1.md';
    const note2old = process.platform === 'win32' ? 'C:\\a\\note2.md' : '/a/note2.md';
    const note2new = process.platform === 'win32' ? 'C:\\a\\subdir\\note2.md' : '/a/subdir/note2.md';
    const note2text = 'has a wiki link: [[link | note1]]';

    beforeAll(() => {
      index = new InMemoryLinkIndex();
      index.addFile(note1, 'has a markdown link: [link](note2.md)');
      index.addFile(note2old, note2text);
      index.finalise();
      index.onFileMoved(note2old, note2new, note2text);

      // todo:test:
      // index.notes
    });

    it('updates links from', () => {
      expect(index.linksFrom(note2new)).toEqual([note1]);
    });

    it('updates dead links', () => {
      expect(index.findAllDeadLinks()).toEqual([new Link(note1, note2old)]);
    });

    it('updates links to', () => {
      index.onFileModified(note1, 'fixed markdown link: [link](subdir/note2.md)');
      expect(index.linksTo(note2new)).toEqual([note1]);
    });

    it('updates absolute paths', () => {
      expect(index.filenameToAbsPath('note2')).toEqual([note2new]);
    });

    it('updates notes', () => {
      expect(Array.from(index.notes())).toEqual([note1, note2new]);
    });
  });

  it('does not index http links', () => {
    const index = new InMemoryLinkIndex();
    const addedFile = '/a/b.txt';
    index.addFile('/a/b.txt', 'a [link](http://to/internet/stuff)');
    index.finalise();

    expect(index.linksFrom(addedFile)).toEqual([]);
    expect(index.containsNote(addedFile)).toBe(true);
    expect(Array.from(index.notes())).toEqual(['/a/b.txt']);
  });
});
