import * as vscode from 'vscode';
import { createService, SearchService } from './searchService';
import { SearchResultTree } from './searchResultTree';
import { extractKeywords } from './keywordExtractor';
import { extractTags } from './tagExtractor';
import { createTagAndKeywordQuery } from './createTagAndKeywordQuery';
import { VsCode } from './vscode';
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

const RELOAD_DELAY_MS = 500;
let lastReload = Date.now();

const handleDocumentContentsChanged = async (
  doc: vscode.TextDocument, searcher: SearchService) =>
{
  const now = Date.now();
  if (now - lastReload < RELOAD_DELAY_MS) { return; }
  // todo: this reloads every 500ms on constant doc changes.
  //       Instead, on doc changes, schedule a search that only
  //       occurs if the last doc change was > timeout
  lastReload = now;
  updateRelatedFiles(doc, searcher);
};

const updateRelatedFiles = async (doc: vscode.TextDocument, searcher: SearchService) => {
  const text = doc.getText();
  if (text.length === 0) {
    return;
  }
  const tags = extractTags(text);
  const keywords = await extractKeywords(text);
  const query = createTagAndKeywordQuery(tags, keywords);
  const results = await searcher
    .search(query)
    .then(results => results
      .filter(r => r !== doc.fileName)
      .map(r => vscode.Uri.file(r)));
  vscode.window.createTreeView('noteSearcher-related', {
    treeDataProvider: new SearchResultTree(results)
  });
};
