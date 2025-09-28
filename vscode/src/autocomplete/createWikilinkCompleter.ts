import { INoteIndex } from '../index/INoteIndex';
import { IFileSystem } from '../utils/IFileSystem';
import { VsCodeWikilinkCompleter } from './VsCodeWikilinkCompleter';

export function createWikilinkCompleter(noteIndex: INoteIndex, fileSystem: IFileSystem) {
  return new VsCodeWikilinkCompleter(noteIndex, fileSystem);
}
