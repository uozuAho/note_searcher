import * as vscode from 'vscode';

export class SearchResultTree implements vscode.TreeDataProvider<SearchResult> {

  private results: SearchResult[];

  constructor(results: vscode.Uri[]) {
    this.results = results.map(r => new SearchResult(r));
  }

  public getTreeItem(element: SearchResult): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: SearchResult): Thenable<SearchResult[]> {
    if (element) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.results);
  }

  public getParent = (element: SearchResult) => {
    return null;
  };
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
}
