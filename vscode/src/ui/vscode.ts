import * as vscode from 'vscode';
import { SearchResultTree } from './searchResultTree';

export interface NoteSearcherUi {
  currentlyOpenDir: () => string | null;
  promptForSearch: (prefill: string) => Promise<string | undefined>;
  showSearchResults: (files: string[]) => Promise<void>;
  showNotification: (message: string) => Promise<void>;
  showError: (e: any) => Promise<void>;
}

export class VsCode implements NoteSearcherUi {
  public currentlyOpenDir = () =>
    vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : null;

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

  public showNotification = async (message: string) => {
    await vscode.window.showInformationMessage(message);
    return;
  };

  public showError = async (e: any) => {
    let msg = 'Argh! Something broke. Sorry! Details:\n\n' + e;
    await openInNewEditor(msg);
  };
}

async function openInNewEditor(content: string, language?: string) {
  const document = await vscode.workspace.openTextDocument({
    language,
    content,
  });
  return await vscode.window.showTextDocument(document);
}
