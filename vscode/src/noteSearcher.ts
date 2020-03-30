import { NoteSearcherUi } from "./vscode";
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
}
