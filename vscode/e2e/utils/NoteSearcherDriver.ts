import {
  InputBox,
  ActivityBar,
  CustomTreeSection, 
  TreeItem
} from 'vscode-extension-tester';

import { VsCodeDriver } from './VsCodeDriver';

export class NoteSearcherDriver {
  constructor(private vscode: VsCodeDriver) { }

  public enable = () => {
    return this.vscode.runCommand('Note searcher: enable in this directory');
  };

  public openSidebar = () => {
    const activityBar = new ActivityBar();
    const sidebar = activityBar.getViewControl('Note Searcher');
    return sidebar.openView();
  };

  public search = async (query: string) => {
    await this.vscode.runCommand('Note searcher: search for docs');
    const input = await InputBox.create();
    await input.setText(query);
    await input.confirm();
  };

  public findSearchResult = async (name: string): Promise<SidebarItem | null> => {
    const searchResults = await this.openSidebarSection('Search results');

    const item = await searchResults.findItem(name);

    return new SidebarItem(item);
  };

  public initCreateNote = () => {
    return this.vscode.runCommand('Note searcher: create a new note');
  };

  public isShowingInDeadLinks = async (name: string) => {
    const deadLinksSection = await this.openSidebarSection('Dead links');

    const item = await deadLinksSection.findItem(name);

    return !!item;
  };

  public findBacklinkByName = async (name: string): Promise<SidebarItem | null> => {
    const backlinks = await this.openSidebarSection('Backlinks');

    const item = await backlinks.findItem(name);

    return new SidebarItem(item);
  };

  public findTagInSidebar = async (tag: string): Promise<SidebarItem | null> => {
    const tags = await this.openSidebarSection('Tags');

    const item = await tags.findItem(name);

    return new SidebarItem(item);
  };

  private openSidebarSection = async (name: string) => {
    const sidebar = await this.openSidebar();
    return await sidebar.getContent().getSection(name) as CustomTreeSection;
  };
}

class SidebarItem {
  constructor(private treeItem: TreeItem) {}

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
