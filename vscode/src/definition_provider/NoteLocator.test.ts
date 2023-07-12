import { NoteLocator } from './NoteLocator';
import { InMemoryLinkIndex } from "../index/InMemoryLinkIndex";

describe('NoteLocator', () => {
  let index: InMemoryLinkIndex;
  let noteLocator: NoteLocator;
  const note1 = process.platform === 'win32' ? 'C:\\a\\note1.md' : '/a/note1.md';
  const note2 = process.platform === 'win32' ? 'C:\\a\\note2.md' : '/a/note2.md';
  const subdirNote1 = process.platform === 'win32' ? 'C:\\a\\subdir\\note1.md' : '/subdir/note1.md';

  beforeAll(() => {
    index = new InMemoryLinkIndex();
    index.addFile(note1, 'file contents');
    index.addFile(note2, 'file contents');
    index.addFile(subdirNote1, 'file contents');
    index.finalise();
    noteLocator = new NoteLocator(index);
  });

  it('returns the note path if the note exists', () => {
    const result = noteLocator.locateNote('note2');
    expect(result).toEqual([note2]);
  });

  it('returns an empty array if the note does not exist', () => {
    const result = noteLocator.locateNote('note3');
    expect(result).toEqual([]);
  });

  it('returns no results for substring matches', () => {
    const result = noteLocator.locateNote('note');
    expect(result).toEqual([]);
  });

  it('returns all paths with matching filenames', () => {
    const result = noteLocator.locateNote('note1');
    expect(result).toEqual([note1, subdirNote1]);
  });
});
