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
  constructor(public uri: vscode.Uri) {
    super(uri, vscode.TreeItemCollapsibleState.None);
  }

  command = {
    title: "Open File",
    command: 'noteSearcher.searchResults.openFile',
    arguments: [this.uri]
  };

  public copyRelativePath = () => {
    vscode.env.clipboard.writeText(this.uri.toString());
  };
}
