import * as path from 'path';
import * as vscode from 'vscode';
import { newCliSearcher, Searcher } from './search';
import * as vsutils from './vscode.utils';
import { SearchResultTree } from './searchResultTree';
import { extractKeywords } from './keywordExtractor';

export function activate(context: vscode.ExtensionContext) {
  const searcher = newCliSearcher(path.join(extensionDir()!, 'out/note_searcher.jar'));

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.search', async () => await search(searcher)));

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.index', async () => await index(searcher)));

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'searchResults.openFile', file => vscode.window.showTextDocument(file)));

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document === vscode.window.activeTextEditor?.document) {
        handleDocumentContentsChanged(e.document, searcher);
      }
    })
  );
}

export function deactivate() {}

const extensionDir = () => {
  return vscode.extensions.getExtension('uozuaho.note-searcher')?.extensionPath;
};

let lastQuery: string;

const search = async (searcher: Searcher) => {
  const input = await vscode.window.showInputBox({
    value: lastQuery,
    prompt: "Search for documents"
  });
  if (!input) {
    return;
  }
  lastQuery = input;
  try {
    const results = await searcher.search(input);
    vscode.window.createTreeView('noteSearcher-results', {
      treeDataProvider: new SearchResultTree(results)
    });
  }
  catch (e) {
    vsutils.openInNewEditor(e);
  }
};

const index = async (searcher: Searcher) => {
  const folder = rootPathOrThrow();

  vscode.window.showInformationMessage('indexing current folder...');

  try {
    await searcher.index(folder);
    vscode.window.showInformationMessage('indexing complete');
  }
  catch (e) {
    vsutils.openInNewEditor(e);
  }
};

const rootPathOrThrow = () => {
  const folder = rootPath();
  if (folder) { return folder; }

  const errMsg = 'note searcher requires a folder open in vscode';
  vscode.window.showErrorMessage(errMsg);
  throw new Error(errMsg);
};

const RELOAD_DELAY_MS = 500;
let lastReload = Date.now();

const handleDocumentContentsChanged = async (
  doc: vscode.TextDocument, searcher: Searcher) =>
{
  const now = Date.now();
  if (now - lastReload < RELOAD_DELAY_MS) { return; }
  // todo: this reloads every 500ms on constant doc changes.
  //       Instead, on doc changes, schedule a search that only
  //       occurs if the last doc change was > timeout
  lastReload = now;
  updateRelatedFiles(doc, searcher);
};

const updateRelatedFiles = async (doc: vscode.TextDocument, searcher: Searcher) => {
  const text = doc.getText();
  if (text.length === 0) {
    return;
  }
  const keywords = await extractKeywords(text);
  const query = keywords.join(' ');
  const results = await searcher.search(query);
  vscode.window.createTreeView('noteSearcher-related', {
    treeDataProvider: new SearchResultTree(results)
  });
};

const rootPath = (): string | null =>
  vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : null;
