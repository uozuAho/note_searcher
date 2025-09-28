export interface INoteIndex {
  /** absolute path of each note in the index */
  notes(): IterableIterator<string>;
  containsNote(absPathOrFilename: string): boolean;
  filenameToAbsPath(filename: string): string[];
}
