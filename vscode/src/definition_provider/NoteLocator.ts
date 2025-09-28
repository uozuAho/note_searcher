import { INoteIndex } from "../index/INoteIndex";

export class NoteLocator {
  constructor(private noteIndex: INoteIndex) { }

  public locateNote(noteName: string) {
    return this.noteIndex.filenameToAbsPath(noteName) || [];
  }
}
