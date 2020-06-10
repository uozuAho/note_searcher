import * as vscode from 'vscode';

import { TagsIndex } from './TagsIndex';

export class TagCompleter implements vscode.CompletionItemProvider {
  constructor(private tagsProvider: TagsIndex) {}

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
