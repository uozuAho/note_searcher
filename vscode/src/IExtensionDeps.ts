import { IMultiIndex } from './index/MultiIndex';
import { INoteSearcherUi } from './ui/INoteSearcherUi';
import { IFileSystem } from './utils/IFileSystem';

export interface IExtensionDeps {
  fs: IFileSystem;
  ui: INoteSearcherUi;
  registry: IVsCodeRegistry;
  buildMultiIndex: (dir: string) => IMultiIndex;
  buildTagCompleter: (index: IMultiIndex) => any;
}
