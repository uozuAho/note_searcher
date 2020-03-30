import { NoteSearcherUi } from "./vscode";
import { Searcher } from "./search";

export class NoteSearcher {
  private previousQuery = '';

  constructor(
    private ui: NoteSearcherUi,
    private searcher: Searcher) {}

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
