import { NoteIndex } from "../index/NoteIndex";

export class NoteLocator {
  constructor(private noteIndex: NoteIndex) { }

  public locateNote(noteName: string) {
    let path = this.noteIndex.filenameToAbsPath(noteName);
    return path ? [path] : [];
  }
}
