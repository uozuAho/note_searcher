import {
  InputBox,
  ActivityBar,
  CustomTreeSection} from 'vscode-extension-tester';
import { SidebarItem } from './SidebarItem';

import { VsCodeDriver } from './VsCodeDriver';

export class NoteSearcherDriver {
  constructor(private vscode: VsCodeDriver) { }

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
    if (!deadLinksSection) { return false; }

    const item = await deadLinksSection.findItem(name);

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

  /** Quirk: throws uncatchable error if section is empty */
  private openSidebarSection = async (name: string): Promise<CustomTreeSection> => {
    const sidebar = await this.openSidebar();
    return await sidebar.getContent().getSection(name) as CustomTreeSection;
  };

  private openSidebar = async () => {
    const activityBar = new ActivityBar();
    const sidebar = await activityBar.getViewControl('Note Searcher');
    if (!sidebar) { throw new Error("Couldn't find Note Searcher in sidebar"); }
    return sidebar.openView();
  };
}
