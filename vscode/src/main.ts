import { NoteSearcher } from './note_searcher/noteSearcher';
import { NoteLocator } from './definition_provider/NoteLocator';
import { IVsCodeExtensionContext } from './vs_code_apis/extensionContext';
import { createWikiLinkDefinitionProvider } from './definition_provider/defProviderCreator';
import { createWikilinkCompleter } from './autocomplete/createWikilinkCompleter';
import { buildDeps } from './buildDeps';

export const extensionId = 'uozuaho.note-searcher';

export async function activate(context: IVsCodeExtensionContext) {
  const {
    fs,
    ui,
    registry,
    buildMultiIndex,
    buildTagCompleter
  } = buildDeps();

  if (!ui.currentlyOpenDir()) {
    return;
  }

  const multiIndex = buildMultiIndex(ui.currentlyOpenDir()!);
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
      buildTagCompleter(multiIndex), ['#']),

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
