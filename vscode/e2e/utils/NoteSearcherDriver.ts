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

  public findSearchResult = async (name: string): Promise<TreeItem | undefined> => {
    const sidebar = await this.openSidebar();
    const searchResults = await sidebar.getContent()
      .getSection('Search results') as CustomTreeSection;
    return await searchResults.findItem(name);
  };

  public initCreateNote = () => {
    return this.vscode.runCommand('Note searcher: create a new note');
  };
}
