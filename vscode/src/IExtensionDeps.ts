import { IMultiIndex } from './index/MultiIndex';
import { INoteSearcherUi } from './ui/INoteSearcherUi';
import { IFileSystem } from './utils/IFileSystem';

export interface IExtensionDeps {
  fs: IFileSystem;
  ui: INoteSearcherUi;
  registry: IVsCodeRegistry;
  indexBuilder: (dir: string) => IMultiIndex;
}
