import * as vscode from 'vscode';

import { createNoteIndex } from './index/NoteIndex';
import { VsCodeNoteSearcherUi } from './ui/VsCodeNoteSearcherUi';
import { NoteSearcher } from './note_searcher/noteSearcher';
import { DeadLinkFinder } from './dead_links/DeadLinkFinder';
import { NoteSearcherConfigProvider } from './note_searcher/NoteSearcherConfigProvider';
import { TagCompleter } from './tag_completion/TagCompleter';
import { createFileSystem } from './utils/FileSystem';

export const extensionId = 'uozuaho.note-searcher';

export function activate(context: vscode.ExtensionContext) {
  const ui = new VsCodeNoteSearcherUi();
  const configProvider = new NoteSearcherConfigProvider(context);
  const noteIndex = createNoteIndex(extensionDir()!, configProvider);
  const deadLinkFinder = new DeadLinkFinder(noteIndex, createFileSystem());
  const noteSearcher = new NoteSearcher(ui, noteIndex, deadLinkFinder, configProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'noteSearcher.search', async () => await noteSearcher.search()),
    vscode.commands.registerCommand(
      'noteSearcher.index', async () => await noteSearcher.index()),
    vscode.commands.registerCommand(
      'noteSearcher.openFile', uri => vscode.window.showTextDocument(uri)),
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

    ui.createCurrentNoteModifiedHandler(),
    ui.createNoteSavedHandler(),
    ui.createMovedViewToDifferentNoteHandler()
  );

  noteSearcher.notifyExtensionActivated();
}

export function deactivate() {}

const extensionDir = () => {
  return vscode.extensions.getExtension(extensionId)?.extensionPath;
};
