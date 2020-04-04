import { NoteSearcherUi, File } from "./ui/NoteSearcherUi";
import { SearchService } from "./searchService";
import { extractTags } from "./text_processing/tagExtractor";
import { extractKeywords } from "./text_processing/keywordExtractor";
import { newDiagnostics, Diagnostics } from "./diagnostics/diagnostics";
import { DelayedExecutor } from "./utils/delayedExecutor";
import { GoodSet } from "./utils/goodSet";

const UPDATE_RELATED_FILES_DELAY_MS = 500;

export class NoteSearcher {
  private previousQuery = '';
  private diagnostics: Diagnostics;

  constructor(
    private ui: NoteSearcherUi,
    private searcher: SearchService,
    private delayedExecutor: DelayedExecutor = new DelayedExecutor())
  {
    ui.addCurrentDocumentChangeListener(this.notifyCurrentFileChanged);
    ui.addDocumentSavedListener(this.notifyFileSaved);
    this.diagnostics = newDiagnostics('noteSearcher');
  }

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

  public updateRelatedFiles = async (file: File) => {
    this.diagnostics.trace('updating related files');

    const text = file.text();

    if (text.length === 0) { return; }

    const relatedFiles = await this
      .searchForRelatedFiles(text)
      .then(results => results
        .filter(r => r !== file.path()));

    this.diagnostics.trace('showing related files');
    this.ui.showRelatedFiles(relatedFiles);
  };

  public createTagAndKeywordQuery = (tags: string[], keywords: string[]) => {
    const keywordsMinusTags = Array.from(
      new GoodSet(keywords).difference(new GoodSet(tags))
    );
    const tagsWithHashes = tags.map(tag => '#' + tag);
    return tagsWithHashes.concat(keywordsMinusTags).join(' ');
  };

  private notifyCurrentFileChanged = (file: File) => {
    this.diagnostics.trace('file changed');

    this.delayedExecutor.cancelAll();
    this.delayedExecutor.executeInMs(UPDATE_RELATED_FILES_DELAY_MS,
      () => this.updateRelatedFiles(file));
  };

  private notifyFileSaved = (file: File) => {
    this.diagnostics.trace('file saved');
    this.index();
  };

  private searchForRelatedFiles = async (text: string) => {
    const tags = extractTags(text);
    const keywords = await extractKeywords(text);
    const query = this.createTagAndKeywordQuery(tags, keywords);

    return await this.searcher.search(query);
  };
}
