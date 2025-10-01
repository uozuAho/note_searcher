import { createTagCompleter } from './autocomplete/tagCompleterCreator';
import { IExtensionDeps } from './IExtensionDeps';
import { DefaultMultiIndex } from './index/DefaultMultiIndex';
import { VsCodeNoteSearcherUi } from './ui/VsCodeNoteSearcherUi';
import { createNodeFileSystem } from './utils/NodeFileSystem';
import { RealVsCodeRegistry } from './vs_code_apis/registryCreator';

export function buildDeps(): IExtensionDeps {
  const fs = createNodeFileSystem();

  return {
    fs,
    ui: new VsCodeNoteSearcherUi(),
    registry: new RealVsCodeRegistry(),
    buildMultiIndex: dir => new DefaultMultiIndex(fs, dir),
    buildTagCompleter: index => createTagCompleter(index),
  };
}
