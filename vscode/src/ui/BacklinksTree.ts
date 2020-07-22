import * as vscode from 'vscode';

export class BacklinksTree implements vscode.TreeDataProvider<Backlink> {

  private backlinks: Backlink[];

  constructor(links: vscode.Uri[]) {
    this.backlinks = links.map(r => new Backlink(r));
  }

  public getTreeItem(element: Backlink): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: Backlink): Thenable<Backlink[]> {
    if (element) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.backlinks);
  }

  public getParent = (element: Backlink) => {
    return null;
  };
}

class Backlink extends vscode.TreeItem {
  constructor(public uri: vscode.Uri) {
    super(uri, vscode.TreeItemCollapsibleState.None);
  }

  command = {
    title: "Open File",
    command: 'noteSearcher.openFile',
    arguments: [this.uri]
  };
}
