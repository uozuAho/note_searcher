import * as vscode from 'vscode';

import { createNoteIndex } from './index/NoteIndex';
import { VsCodeNoteSearcherUi } from './ui/VsCodeNoteSearcherUi';
import { NoteSearcher } from './note_searcher/noteSearcher';
import { NewDeadLinkFinder } from './dead_links/NewDeadLinkFinder';
import { NoteSearcherConfigProvider } from './note_searcher/NoteSearcherConfigProvider';
import { TagCompleter } from './tag_completion/TagCompleter';

export const extensionId = 'uozuaho.note-searcher';

export function activate(context: vscode.ExtensionContext) {
  const ui = new VsCodeNoteSearcherUi();
  const configProvider = new NoteSearcherConfigProvider(context);
  const noteIndex = createNoteIndex(extensionDir()!, configProvider);
  const deadLinkFinder = new NewDeadLinkFinder(noteIndex);
  const noteSearcher = new NoteSearcher(ui, noteIndex, deadLinkFinder, configProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'noteSearcher.search', async () => await noteSearcher.search()),
    vscode.commands.registerCommand(
      'noteSearcher.index', async () => await noteSearcher.index()),
    vscode.commands.registerCommand(
      'noteSearcher.searchResults.openFile',
      searchResult => vscode.window.showTextDocument(searchResult)),
    vscode.commands.registerCommand(
      'noteSearcher.searchResults.copyLink',
      searchResult => noteSearcher.markdownLinkToClipboard(searchResult.uri.fsPath)),
    vscode.commands.registerCommand(
      'noteSearcher.editorTab.copyLink',
      uri => noteSearcher.markdownLinkToClipboard(uri.fsPath)),
    vscode.commands.registerCommand(
      'noteSearcher.enableCurrentDir', () => noteSearcher.enable()),
    vscode.commands.registerCommand(
      'noteSearcher.disableCurrentDir', () => noteSearcher.disable()),
    vscode.commands.registerCommand(
      'noteSearcher.createNote', () => noteSearcher.createNote()),

    vscode.languages.registerCompletionItemProvider(['markdown', 'plaintext'],
      new TagCompleter(noteIndex), '#'),

    ui.createOnDidChangeTextDocumentHandler(),
    ui.createOnDidSaveDocumentHandler()
  );

  noteSearcher.notifyExtensionActivated();
}

export function deactivate() {}

const extensionDir = () => {
  return vscode.extensions.getExtension(extensionId)?.extensionPath;
};
