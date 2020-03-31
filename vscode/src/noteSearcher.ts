import { NoteSearcherUi } from "./ui/NoteSearcherUi";
import { SearchService } from "./searchService";
import { extractTags } from "./text_processing/tagExtractor";
import { extractKeywords } from "./text_processing/keywordExtractor";
import { createTagAndKeywordQuery } from "./createTagAndKeywordQuery";

const RELOAD_DELAY_MS = 500;

export class NoteSearcher {
  private previousQuery = '';
  private lastReloadTime = Date.now();

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

  public notifyCurrentFileChanged = () => {
    const now = Date.now();
    if (now - this.lastReloadTime < RELOAD_DELAY_MS) { return; }
    // todo: this reloads every 500ms on constant doc changes.
    //       Instead, on doc changes, schedule a search that only
    //       occurs if the last doc change was > timeout
    this.lastReloadTime = now;
    this.updateRelatedFiles();
  };

  private updateRelatedFiles = async () => {
    const currentFile = this.ui.getCurrentFile();

    if (!currentFile) { throw new Error('no file is open!'); }

    const text = currentFile.text();

    if (text.length === 0) { return; }

    const relatedFiles = await this
      .searchForRelatedFiles(text)
      .then(results => results
        .filter(r => r !== currentFile.path()));

    // this.ui.showRelatedFiles(relatedFiles);
  };

  private searchForRelatedFiles = async (text: string) => {
    const tags = extractTags(text);
    const keywords = await extractKeywords(text);
    const query = createTagAndKeywordQuery(tags, keywords);

    return await this.searcher.search(query);
  };
}
