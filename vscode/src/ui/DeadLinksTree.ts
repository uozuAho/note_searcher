import * as vscode from 'vscode';

export class DeadLinksTree implements vscode.TreeDataProvider<FileWithDeadLinks> {

  private results: FileWithDeadLinks[];

  constructor(results: vscode.Uri[]) {
    this.results = results.map(r => new FileWithDeadLinks(r));
  }

  public getTreeItem(element: FileWithDeadLinks): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: FileWithDeadLinks): Thenable<FileWithDeadLinks[]> {
    if (element) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.results);
  }

  public getParent = (element: FileWithDeadLinks) => {
    return null;
  };

  public getAllItems = (): FileWithDeadLinks[] => {
    return this.results;
  };
}

class FileWithDeadLinks extends vscode.TreeItem {
  constructor(public uri: vscode.Uri) {
    super(uri, vscode.TreeItemCollapsibleState.None);
  }

  command = {
    title: "Open File",
    command: 'noteSearcher.searchResults.openFile',
    arguments: [this.uri]
  };
}
