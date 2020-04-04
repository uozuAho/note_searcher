import * as vscode from 'vscode';
import { createService } from './searchService';
import { VsCode } from './ui/vscode';
import { NoteSearcher } from './noteSearcher';

export function activate(context: vscode.ExtensionContext) {
  const ui = new VsCode();
  const searcher = createService(extensionDir()!);
  const noteSearcher = new NoteSearcher(ui, searcher);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.search', async () => await noteSearcher.search()));

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.index', async () => await noteSearcher.index()));

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'searchResults.openFile', file => vscode.window.showTextDocument(file)));

  context.subscriptions.push(ui.createOnDidChangeTextDocumentHandler());
}

export function deactivate() {}

const extensionDir = () => {
  return vscode.extensions.getExtension('uozuaho.note-searcher')?.extensionPath;
};
