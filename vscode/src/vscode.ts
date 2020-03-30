import * as vscode from 'vscode';
import { SearchResultTree } from './searchResultTree';

export interface NoteSearcherUi {
  promptForSearch: (prefill: string) => Promise<string | undefined>;
  showSearchResults: (files: string[]) => Promise<void>;
  showError: (e: any) => Promise<void>;
}

export class VsCode implements NoteSearcherUi {
  public promptForSearch = async (prefill: string) => {
    return await vscode.window.showInputBox({
      value: prefill,
      prompt: "Search for documents"
    });
  };

  public showSearchResults = async (files: string[]) => {
    const uris = files.map(f => vscode.Uri.file(f));
    vscode.window.createTreeView('noteSearcher-results', {
      treeDataProvider: new SearchResultTree(uris)
    });
  };

  public showError = async (e: any) => {
    await openInNewEditor(e);
  };
}

async function openInNewEditor(content: string, language?: string) {
  const document = await vscode.workspace.openTextDocument({
    language,
    content,
  });
  return await vscode.window.showTextDocument(document);
}
