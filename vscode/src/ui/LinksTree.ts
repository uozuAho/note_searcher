import * as vscode from 'vscode';

export class LinksTree implements vscode.TreeDataProvider<Link> {

  private links: Link[];

  constructor(links: vscode.Uri[]) {
    this.links = links.map(r => new Link(r));
  }

  public getTreeItem(element: Link): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: Link): Thenable<Link[]> {
    if (element) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.links);
  }

  public getParent = (element: Link) => {
    return null;
  };
}

class Link extends vscode.TreeItem {
  constructor(public uri: vscode.Uri) {
    super(uri, vscode.TreeItemCollapsibleState.None);
  }

  command = {
    title: "Open File",
    command: 'noteSearcher.openFile',
    arguments: [this.uri]
  };
}
