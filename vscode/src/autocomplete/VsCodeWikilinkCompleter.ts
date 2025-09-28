import * as vscode from 'vscode';
import path = require('path');
import { NoteIndex } from '../index/NoteIndex';
import { IFileSystem } from '../utils/IFileSystem';

export class VsCodeWikilinkCompleter implements vscode.CompletionItemProvider {
  constructor(
    private noteIndex: NoteIndex,
    private fileSystem: IFileSystem) {}

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    if (!this.shouldAutocomplete(document, position)) {
      return Promise.resolve([]);
    }

    return Promise.resolve(
      Array.from(this.noteIndex.notes())
        .map(absPath => {
          const label = path.basename(absPath, '.md');
          const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.File);
          item.detail = absPath;
          return item;
        })
    );
  }

  resolveCompletionItem(item: vscode.CompletionItem) {
    const notePath = item.detail;
    if (notePath) {
      const text = this.fileSystem.readFile(notePath);
      item.documentation = text;
    }
    return item;
  }

  private shouldAutocomplete(document: vscode.TextDocument, position: vscode.Position) {
    const charNum = position.character;

    if (charNum < 2) { return false; }

    return document
      .lineAt(position.line)
      .text.substring(charNum - 2, charNum ) === '[[';
  }
}
