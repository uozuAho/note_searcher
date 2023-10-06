import * as vscode from 'vscode';
import { NoteIndex } from '../index/NoteIndex';
import path = require('path');

export class VsCodeWikilinkCompleter implements vscode.CompletionItemProvider {
  constructor(private noteIndex: NoteIndex) {}

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext)
    : vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList>
  {
    if (!this.shouldAutocomplete(document, position)) {
      return Promise.resolve([]);
    }

    return Promise.resolve(
      Array.from(this.noteIndex.notes())
        .map(t => path.basename(t, '.md'))
        .map(t => new vscode.CompletionItem(t, vscode.CompletionItemKind.Text))
    );
  }

  private shouldAutocomplete(document: vscode.TextDocument, position: vscode.Position) {
    if (position.character < 2) {
      return false;
    }

    const prev = document
      .lineAt(position.line)
      .text.substring(position.character - 2, position.character - 1);

    return prev === "[";
  }
}
