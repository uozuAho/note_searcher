import * as vscode from 'vscode';
import * as path from 'path';

export class DummyTreeData implements vscode.TreeDataProvider<Dependency> {
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (element) {
      return Promise.resolve([]);
    }
    return Promise.resolve([
      new Dependency('asdf', '0.0.1', vscode.TreeItemCollapsibleState.Collapsed),
      new Dependency('qwerty', '0.0.1', vscode.TreeItemCollapsibleState.Collapsed),
      new Dependency('foo', '0.0.1', vscode.TreeItemCollapsibleState.Collapsed)
    ]);
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}-${this.version}`;
  }

  get description(): string {
    return this.version;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}
