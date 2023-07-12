import { NoteIndex } from "../index/NoteIndex";

export class NoteLocator {
  constructor(private noteIndex: NoteIndex) { }

  public locateNote(noteName: string) {
    return this.noteIndex.filenameToAbsPath(noteName) || [];
  }
}
