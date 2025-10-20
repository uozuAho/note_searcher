import { NoteLocator } from './definition_provider/NoteLocator';
import { IMultiIndex } from './index/MultiIndex';
import { INoteSearcherUi } from './ui/INoteSearcherUi';
import { IFileSystem } from './utils/IFileSystem';

export interface IExtensionDeps {
  fs: IFileSystem;
  ui: INoteSearcherUi;
  registry: IVsCodeRegistry;
  buildMultiIndex: (dir: string) => IMultiIndex;
  buildWikilinkCompleter: (index: IMultiIndex, fs: IFileSystem) => any;
  buildWikiLinkDefinitionProvider: (noteLocator: NoteLocator) => any;
}
