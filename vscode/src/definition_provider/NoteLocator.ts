import { NoteIndex } from "../index/NoteIndex";

export class NoteLocator {
  constructor(private noteIndex: NoteIndex) { }

  public async locateNote(noteName: string) {
    if (this.noteIndex.containsNote(noteName)) {
      let path = this.noteIndex.filenameToAbsPath(noteName);
      return path ? [path] : [];
    }

    // else: substring match
    return Array
      .from(this.noteIndex.notes())
      .filter(path => path.includes(noteName));
  }
}
