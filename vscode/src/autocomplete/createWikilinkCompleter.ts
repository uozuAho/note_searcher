import { NoteIndex } from '../index/NoteIndex';
import { IFileSystem } from '../utils/IFileSystem';
import { VsCodeWikilinkCompleter } from './VsCodeWikilinkCompleter';

export function createWikilinkCompleter(noteIndex: NoteIndex, fileSystem: IFileSystem) {
  return new VsCodeWikilinkCompleter(noteIndex, fileSystem);
}
