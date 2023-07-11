import { NoteLocator } from './NoteLocator';
import { InMemoryLinkIndex } from "../index/InMemoryLinkIndex";

describe('NoteLocator', () => {
  let index: InMemoryLinkIndex;
  let noteLocator: NoteLocator;
  const note1 = process.platform === 'win32' ? 'C:\\a\\note1.md' : '/a/note1.md';
  const note2 = process.platform === 'win32' ? 'C:\\a\\note2.md' : '/a/note2.md';

  beforeAll(() => {
    index = new InMemoryLinkIndex();
    index.addFile(note1, 'file contents');
    index.addFile(note2, 'file contents');
    index.finalise();
    noteLocator = new NoteLocator(index);
  });

  it('returns the note path if the note exists', () => {
    const result = noteLocator.locateNote('note1');
    expect(result).toEqual([note1]);
  });

  it('returns an empty array if the note does not exist', () => {
    const result = noteLocator.locateNote('note3');
    expect(result).toEqual([]);
  });

  it('returns a single note path if the given name is a substring of a single note', () => {
    const result = noteLocator.locateNote('note');
    expect(result).toEqual([note1, note2]);
  });

  it('returns multiple results if the given name is a substring of multiple notes', () => {
    const result = noteLocator.locateNote('note');
    expect(result).toEqual([note1, note2]);
  });
});
