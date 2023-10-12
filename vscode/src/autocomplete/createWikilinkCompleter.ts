import { NoteIndex } from '../index/NoteIndex';
import { FileSystem } from '../utils/FileSystem';
import { VsCodeWikilinkCompleter } from './VsCodeWikilinkCompleter';

export function createWikilinkCompleter(noteIndex: NoteIndex, fileSystem: FileSystem) {
  return new VsCodeWikilinkCompleter(noteIndex, fileSystem);
}
