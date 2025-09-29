import { IMultiIndex } from './index/MultiIndex';
import { NoteSearcher } from './note_searcher/noteSearcher';
import { NoteLocator } from './definition_provider/NoteLocator';
import { IVsCodeExtensionContext } from './vs_code_apis/extensionContext';
import { createVsCodeRegistry } from './vs_code_apis/registryCreator';
import { createTagCompleter } from './autocomplete/tagCompleterCreator';
import { createWikiLinkDefinitionProvider } from './definition_provider/defProviderCreator';
import { createFileSystem } from './utils/NodeFileSystem';
import { createWikilinkCompleter } from './autocomplete/createWikilinkCompleter';
import { IFileSystem } from './utils/IFileSystem';
import { INoteSearcherUi } from './ui/INoteSearcherUi';
import { DefaultMultiIndex } from './index/DefaultMultiIndex';
import { createNoteSearcherUi } from './ui/uiCreator';

export const extensionId = 'uozuaho.note-searcher';

interface IExtensionDeps {
  fs: IFileSystem,
  ui: INoteSearcherUi,
  registry: IVsCodeRegistry, // todo: is this really needed?
  indexBuilder: (dir: string) => IMultiIndex,
}

// todo: extract to file, mock in acceptance tests.
function getDeps(): IExtensionDeps {
  const fs = createFileSystem();

  return {
    fs,
    ui: createNoteSearcherUi(), // todo: inline these
    registry: createVsCodeRegistry(),
    indexBuilder: dir => new DefaultMultiIndex(fs, dir)
  };
}

export async function activate(context: IVsCodeExtensionContext) {
  const {fs, ui, registry, indexBuilder } = getDeps();
  if (!ui.currentlyOpenDir()) {
    return;
  }
  const multiIndex = indexBuilder(ui.currentlyOpenDir()!);
  const noteSearcher = new NoteSearcher(ui, multiIndex, fs);
  const noteLocator = new NoteLocator(multiIndex);

  context.subscriptions.push(
    registry.registerCommand(
      'noteSearcher.search', async () => await noteSearcher.promptAndSearch()),
    registry.registerCommand(
      'noteSearcher.searchForTag', async (tag: string) => await noteSearcher.search('#' + tag)),
    registry.registerCommand(
      'noteSearcher.index', async () => {
        await noteSearcher.indexWorkspace();
        noteSearcher.refreshSidebar();
      }),
    registry.registerCommand(
      'noteSearcher.openFile', uri => ui.openFile(uri.fsPath)),
    registry.registerCommand(
      'noteSearcher.explorer.copyWikiLink',
      item => noteSearcher.wikiLinkToClipboard(item.fsPath)),
    registry.registerCommand(
      'noteSearcher.searchResults.copyMarkdownLink',
      searchResult => noteSearcher.markdownLinkToClipboard(searchResult.uri.fsPath)),
    registry.registerCommand(
      'noteSearcher.searchResults.copyWikiLink',
      searchResult => noteSearcher.wikiLinkToClipboard(searchResult.uri.fsPath)),
    registry.registerCommand(
      'noteSearcher.editorTab.copyMarkdownLink',
      uri => noteSearcher.markdownLinkToClipboard(uri.fsPath)),
    registry.registerCommand(
      'noteSearcher.editorTab.copyWikiLink',
      uri => noteSearcher.wikiLinkToClipboard(uri.fsPath)),
    registry.registerCommand(
      'noteSearcher.createNote', () => noteSearcher.createNote()),

    registry.registerCompletionItemProvider(['markdown', 'plaintext'],
      createTagCompleter(multiIndex), ['#']),

    registry.registerCompletionItemProvider(['markdown', 'plaintext'],
      createWikilinkCompleter(multiIndex, fs), ['[']),

    registry.registerDefinitionProvider(['markdown', 'plaintext'],
      createWikiLinkDefinitionProvider(noteLocator)),

    ui.createNoteSavedHandler(),
    ui.createNoteDeletedHandler(),
    ui.createNoteMovedHandler(),
    ui.createMovedViewToDifferentNoteHandler()
  );

  await noteSearcher.notifyExtensionActivated();
}

export function deactivate() {}
