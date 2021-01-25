export interface NoteIndex {
  /** absolute path of each note in the index */
  notes(): IterableIterator<string>;

  containsNote(absPathOrFilename: string): boolean;
}
