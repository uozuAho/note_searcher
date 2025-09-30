import { IExtensionDeps } from './IExtensionDeps';
import { DefaultMultiIndex } from './index/DefaultMultiIndex';
import { VsCodeNoteSearcherUi } from './ui/VsCodeNoteSearcherUi';
import { createFileSystem } from './utils/NodeFileSystem';
import { createVsCodeRegistry } from './vs_code_apis/registryCreator';


// todo: inline stuff, remove old builders

export function buildDeps(): IExtensionDeps {
  const fs = createFileSystem();

  return {
    fs,
    ui: new VsCodeNoteSearcherUi(),
    registry: createVsCodeRegistry(),
    indexBuilder: dir => new DefaultMultiIndex(fs, dir)
  };
}
