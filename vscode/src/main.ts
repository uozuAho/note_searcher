import * as vscode from 'vscode';
import { createService as createSearchService } from './searchService';
import { VsCode } from './ui/vscode';
import { NoteSearcher } from './noteSearcher';
import { DeadLinkFinder } from './DeadLinkFinder';
import { createFileSystem } from './utils/FileSystem';
import { NoteSearcherConfigProvider } from './NoteSearcherConfigProvider';

export const extensionId = 'uozuaho.note-searcher';

export function activate(context: vscode.ExtensionContext) {
  const ui = new VsCode();
  const searcher = createSearchService(extensionDir()!);
  const deadLinkFinder = new DeadLinkFinder(createFileSystem());
  const configProvider = new NoteSearcherConfigProvider(context);

  const noteSearcher = new NoteSearcher(ui,
    searcher, deadLinkFinder, configProvider);

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

    ui.createOnDidChangeTextDocumentHandler(),
    ui.createOnDidSaveDocumentHandler()
  );
}

export function deactivate() {}

const extensionDir = () => {
  return vscode.extensions.getExtension(extensionId)?.extensionPath;
};
