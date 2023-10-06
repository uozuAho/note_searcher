import { NoteIndex } from '../index/NoteIndex';
import { VsCodeWikilinkCompleter } from './VsCodeWikilinkCompleter';

export function createWikilinkCompleter(noteIndex: NoteIndex) {
  return new VsCodeWikilinkCompleter(noteIndex);
}
