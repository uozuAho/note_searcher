import { VsCodeWikilinkCompleter } from './autocomplete/VsCodeWikilinkCompleter';
import { VsCodeWikiLinkDefinitionProvider } from './definition_provider/VsCodeWikiLinkDefinitionProvider';
import { NullDiagnostics } from './diagnostics/diagnostics';
import { IExtensionDeps } from './IExtensionDeps';
import { DefaultMultiIndex } from './index/DefaultMultiIndex';
import { VsCodeNoteSearcherUi } from './ui/VsCodeNoteSearcherUi';
import { createNodeFileSystem } from './utils/NodeFileSystem';
import { RealVsCodeRegistry } from './vs_code_apis/registryCreator';

export function buildDeps(): IExtensionDeps {
  const fs = createNodeFileSystem();
  const diagnostics = new NullDiagnostics();
  // const diagnostics = new VsCodeDiagnostics(new DateTimeProvider());

  return {
    fs,
    ui: new VsCodeNoteSearcherUi(),
    registry: new RealVsCodeRegistry(),
    buildMultiIndex: dir => new DefaultMultiIndex(fs, dir, diagnostics),
    buildWikilinkCompleter: (index, fs) => new VsCodeWikilinkCompleter(index, fs),
    buildWikiLinkDefinitionProvider: noteLocator =>
      new VsCodeWikiLinkDefinitionProvider(noteLocator),
  };
}
