import { expect } from 'chai';

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

  public findSearchResult = async (name: string): Promise<SearchResult> => {
    const sidebar = await this.openSidebar();

    const searchResults = await sidebar.getContent()
      .getSection('Search results') as CustomTreeSection;

    const item = await searchResults.findItem(name);

    if (!item) { expect.fail(`could not find search result '${name}'`); }

    return new SearchResult(item);
  };

  public initCreateNote = () => {
    return this.vscode.runCommand('Note searcher: create a new note');
  };

  public isShowingInDeadLinks = async (name: string) => {
    const sidebar = await this.openSidebar();

    const searchResults = await sidebar.getContent()
      .getSection('Dead links') as CustomTreeSection;

    const item = await searchResults.findItem(name);

    return !!item;
  };
}

class SearchResult {
  constructor(private treeItem: TreeItem) {}

  public click = () => {
    return this.treeItem.click();
  };

  public clickContextMenuItem = async (itemName: string) => {
    const menu = await this.treeItem.openContextMenu();
    const menuItem = await menu.getItem(itemName);
    if (!menuItem) { expect.fail(`could not find menu item '${itemName}'`); }
    await menuItem.click();
  };
}
