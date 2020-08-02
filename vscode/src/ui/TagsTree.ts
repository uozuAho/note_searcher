import * as vscode from 'vscode';

export class TagsTree implements vscode.TreeDataProvider<Tag> {

  private tags: Tag[];

  constructor(tags: string[]) {
    this.tags = tags.map(t => new Tag(t));
  }

  public getTreeItem(element: Tag): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: Tag): Thenable<Tag[]> {
    if (element) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.tags);
  }

  public getParent = (element: Tag) => {
    return null;
  };
}

class Tag extends vscode.TreeItem {
  constructor(public name: string) {
    super(name, vscode.TreeItemCollapsibleState.None);
  }

  command = {
    title: "Search for tag",
    command: 'noteSearcher.searchForTag',
    arguments: [this.name]
  };
}
