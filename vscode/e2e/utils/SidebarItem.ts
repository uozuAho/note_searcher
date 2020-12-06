import { ViewItem } from 'vscode-extension-tester';

export class SidebarItem {
  constructor(private treeItem: ViewItem) { }

  public click = () => {
    return this.treeItem.click();
  };

  public clickContextMenuItem = async (itemName: string) => {
    const menu = await this.treeItem.openContextMenu();
    const menuItem = await menu.getItem(itemName);
    if (!menuItem) { throw new Error(`could not find menu item '${itemName}'`); }
    await menuItem.click();
  };
}
