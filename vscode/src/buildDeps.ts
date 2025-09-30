import { IExtensionDeps } from './IExtensionDeps';
import { DefaultMultiIndex } from './index/DefaultMultiIndex';
import { createNoteSearcherUi } from './ui/uiCreator';
import { createFileSystem } from './utils/NodeFileSystem';
import { createVsCodeRegistry } from './vs_code_apis/registryCreator';

export function buildDeps(): IExtensionDeps {
  const fs = createFileSystem();

  return {
    fs,
    ui: createNoteSearcherUi(), // todo: inline these
    registry: createVsCodeRegistry(),
    indexBuilder: dir => new DefaultMultiIndex(fs, dir)
  };
}
