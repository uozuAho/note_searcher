import * as vscode from 'vscode';

export class SearchResultTree implements vscode.TreeDataProvider<SearchResult> {
  constructor(private results: vscode.Uri[]) {}

  getTreeItem(element: SearchResult): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SearchResult): Thenable<SearchResult[]> {
    if (element) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.results.map(r => new SearchResult(r)));
  }
}

class SearchResult extends vscode.TreeItem {
  constructor(uri: vscode.Uri) {
    super(uri.fsPath, vscode.TreeItemCollapsibleState.Collapsed);
  }
}
