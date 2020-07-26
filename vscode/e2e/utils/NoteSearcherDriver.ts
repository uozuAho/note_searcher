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

  public search = async (query: string) => {
    await this.vscode.runCommand('Note searcher: search for docs');
    const input = await InputBox.create();
    await input.setText(query);
    await input.confirm();
  };

  public findSearchResult = async (name: string): Promise<SidebarItem | null> => {
    const searchResults = await this.openSidebarSection('Search results');
    if (!searchResults) { return null; }

    const item = await searchResults.findItem(name);
    if (!item) { return null; }

    return new SidebarItem(item);
  };

  public initCreateNote = () => {
    return this.vscode.runCommand('Note searcher: create a new note');
  };

  public isShowingInDeadLinks = async (name: string) => {
    const deadLinksSection = await this.openSidebarSection('Dead links');
    if (!deadLinksSection) { return null; }

    const item = await deadLinksSection.findItem(name);
    if (!item) { return null; }

    return !!item;
  };

  public findBacklinkByName = async (name: string): Promise<SidebarItem | null> => {
    const backlinks = await this.openSidebarSection('Backlinks');
    if (!backlinks) { return null; }

    const item = await backlinks.findItem(name);
    if (!item) { return null; }

    return new SidebarItem(item);
  };

  public findTagInSidebar = async (tag: string): Promise<SidebarItem | null> => {
    const tags = await this.openSidebarSection('All Tags');
    if (!tags) { return null; }

    const item = await tags.findItem(tag);
    if (!item) { return null; }

    return new SidebarItem(item);
  };

  /** Quirk: Returns null if the section is empty */
  private openSidebarSection = async (name: string): Promise<CustomTreeSection | null> => {
    const sidebar = await this.openSidebar();
    try {
      return await sidebar.getContent().getSection(name) as CustomTreeSection;
    } catch (e) {
      // ui test lib throws when the list is empty, so return null instead
      return null;
    }
  };

  private openSidebar = () => {
    const activityBar = new ActivityBar();
    const sidebar = activityBar.getViewControl('Note Searcher');
    return sidebar.openView();
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
