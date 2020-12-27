import * as vscode from 'vscode';
import { Link } from '../index/noteLinkIndex';

export class DeadLinksTree implements vscode.TreeDataProvider<TreeNode> {

  /** map of sourcePath: links */
  private linkMap: Map<string, string[]>;

  constructor(links: Link[]) {
    this.linkMap = new Map();

    for (const link of links) {
      let links = this.linkMap.get(link.sourcePath);
      if (!links) {
        this.linkMap.set(link.sourcePath, [link.targetPath]);
      } else {
        links.push(link.targetPath);
      }
    }
  }

  public getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: TreeNode): Thenable<TreeNode[]> {
    if (element) {
      const children = this.linkMap.get(element.path);
      if (children) {
        return Promise.resolve(children.map(c => new LinkNode(c)));
      }
    }
    return Promise.resolve(Array.from(this.linkMap.keys()).map(l => new FileNode(l)));
  }

  public getParent = (element: TreeNode) => {
    return null;
  };
}

type TreeNode = FileNode | LinkNode;

class FileNode extends vscode.TreeItem {
  constructor(public path: string) {
    super(vscode.Uri.file(path), vscode.TreeItemCollapsibleState.Expanded);
  }

  command = {
    title: "Open File",
    command: 'noteSearcher.openFile',
    arguments: [this.resourceUri]
  };
}

class LinkNode extends vscode.TreeItem {
  constructor(public path: string) {
    super(vscode.Uri.file(path), vscode.TreeItemCollapsibleState.None);
  }
}
