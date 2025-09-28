import * as vscode from 'vscode';

import { ITagIndex } from '../index/TagIndex';

export class VsCodeTagCompleter implements vscode.CompletionItemProvider {
  constructor(private tagsProvider: ITagIndex) {}

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext)
    : vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList>
  {
    return Promise.resolve(
      this.tagsProvider.allTags()
        .map(t => new vscode.CompletionItem(t, vscode.CompletionItemKind.Text))
    );
  }
}
