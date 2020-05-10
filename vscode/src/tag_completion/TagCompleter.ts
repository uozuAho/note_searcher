import * as vscode from 'vscode';

import { TagsProvider } from './TagsProvider';

export class TagCompleter implements vscode.CompletionItemProvider {
  constructor(private tagsProvider: TagsProvider) {}

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
