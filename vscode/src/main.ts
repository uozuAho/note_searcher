import * as vscode from 'vscode';
import { createFullTextSearch } from './search/FullTextSearch';
import { VsCodeNoteSearcherUi } from './ui/VsCodeNoteSearcherUi';
import { NoteSearcher } from './note_searcher/noteSearcher';
import { DeadLinkFinder } from './note_searcher/DeadLinkFinder';
import { createFileSystem } from './utils/FileSystem';
import { NoteSearcherConfigProvider } from './note_searcher/NoteSearcherConfigProvider';
import { NoteSearcherUi } from './ui/NoteSearcherUi';

export const extensionId = 'uozuaho.note-searcher';

export function activate(context: vscode.ExtensionContext) {
  const ui = new VsCodeNoteSearcherUi();
  const noteSearcher = createNoteSearcher(context, ui);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'noteSearcher.search', async () => await noteSearcher.search()),
    vscode.commands.registerCommand(
      'noteSearcher.index', async () => await noteSearcher.index()),
    vscode.commands.registerCommand(
      'noteSearcher.searchResults.openFile',
      file => vscode.window.showTextDocument(file)),
    vscode.commands.registerCommand(
      'noteSearcher.enableCurrentDir', () => noteSearcher.enable()),
    vscode.commands.registerCommand(
      'noteSearcher.disableCurrentDir', () => noteSearcher.disable()),
    vscode.commands.registerCommand(
      'noteSearcher.createNote', () => noteSearcher.createNote()),

    ui.createOnDidChangeTextDocumentHandler(),
    ui.createOnDidSaveDocumentHandler()
  );

  noteSearcher.notifyExtensionActivated();
}

export function deactivate() {}

const createNoteSearcher = (context: vscode.ExtensionContext, ui: NoteSearcherUi) => {
  const configProvider = new NoteSearcherConfigProvider(context);
  const searcher = createFullTextSearch(extensionDir()!, configProvider);
  const deadLinkFinder = new DeadLinkFinder(createFileSystem());

  return new NoteSearcher(ui, searcher, deadLinkFinder, configProvider);
};

const extensionDir = () => {
  return vscode.extensions.getExtension(extensionId)?.extensionPath;
};
