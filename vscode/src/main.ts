import { createMultiIndex } from './index/MultiIndex';
import { NoteSearcher } from './note_searcher/noteSearcher';
import { NoteLocator } from './definition_provider/NoteLocator';
import { createNoteSearcherUi } from './ui/uiCreator';
import { VsCodeExtensionContext } from './vs_code_apis/extensionContext';
import { createVsCodeRegistry } from './vs_code_apis/registryCreator';
import { createTagCompleter } from './tag_completion/tagCompleterCreator';
import { createWikiLinkDefinitionProvider } from './definition_provider/defProviderCreator';
import { createFileSystem } from './utils/FileSystem';

export const extensionId = 'uozuaho.note-searcher';

export async function activate(context: VsCodeExtensionContext) {
  const fs = createFileSystem();
  const ui = createNoteSearcherUi();
  const registry = createVsCodeRegistry();
  const workspaceDir = ui.currentlyOpenDir();
  if (!workspaceDir) {
    return;
  }
  const multiIndex = createMultiIndex(workspaceDir);
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
