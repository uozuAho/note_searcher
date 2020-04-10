import * as vscode from 'vscode';
import { SearchResultTree } from './searchResultTree';
import { NoteSearcherUi, FileChangeListener } from './NoteSearcherUi';
import { File } from "../utils/File";

export class VsCode implements NoteSearcherUi {
  private currentDocChangeListener: FileChangeListener | null = null;
  private documentSavedListener: FileChangeListener | null = null;

  public getCurrentFile = () => 
    vscode.window.activeTextEditor
      ? new VsCodeFile(vscode.window.activeTextEditor.document)
      : null;

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

  public showRelatedFiles = (files: string[]) => {
    const uris = files.map(f => vscode.Uri.file(f));
    vscode.window.createTreeView('noteSearcher-related', {
      treeDataProvider: new SearchResultTree(uris)
    });
  };

  public showNotification = async (message: string) => {
    await vscode.window.showInformationMessage(message);
  };

  public showError = async (e: any) => {
    let msg = 'Argh! Something broke. Sorry! Details:\n\n' + e;
    await openInNewEditor(msg);
  };

  public addCurrentDocumentChangeListener = (listener: FileChangeListener) => {
    this.currentDocChangeListener = listener;
  };

  public addDocumentSavedListener = (listener: FileChangeListener) => {
    this.documentSavedListener = listener;
  };

  public createOnDidChangeTextDocumentHandler = () => {
    return vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document === vscode.window.activeTextEditor?.document) {
        if (this.currentDocChangeListener) {
          const file = new VsCodeFile(e.document);
          this.currentDocChangeListener(file);
        }
      }
    });
  };

  public createOnDidSaveDocumentHandler = () => {
    return vscode.workspace.onDidSaveTextDocument(doc => {
      if (this.documentSavedListener) {
        const file = new VsCodeFile(doc);
        this.documentSavedListener(file);
      }
    });
  };
}

class VsCodeFile implements File {
  constructor(private doc: vscode.TextDocument) {}

  text = () => this.doc.getText();
  path = () => this.doc.fileName;
}

async function openInNewEditor(content: string, language?: string) {
  const document = await vscode.workspace.openTextDocument({
    language,
    content,
  });
  return await vscode.window.showTextDocument(document);
}
