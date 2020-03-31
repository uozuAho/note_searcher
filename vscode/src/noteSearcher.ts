import { NoteSearcherUi } from "./ui/vscode";
import { SearchService } from "./searchService";

export class NoteSearcher {
  private previousQuery = '';

  constructor(
    private ui: NoteSearcherUi,
    private searcher: SearchService) {}

  public search = async () => {
    const input = await this.ui.promptForSearch(this.previousQuery);
    if (!input) {
      return;
    }
    this.previousQuery = input;
    try {
      const results = await this.searcher.search(input);
      await this.ui.showSearchResults(results);
    }
    catch (e) {
      await this.ui.showError(e);
    }
  };

  public index = async () => {
    const folder = this.ui.currentlyOpenDir();
    if (!folder) {
      await this.ui.showNotification('open a folder first');
      return;
    }

    this.ui.showNotification('indexing current folder...');

    try {
      await this.searcher.index(folder);
      this.ui.showNotification('indexing complete');
    }
    catch (e) {
      await this.ui.showError(e);
    }
  };
}
