import { NoteSearcherUi } from "../ui/NoteSearcherUi";
import { File } from "../utils/File";
import { SearchService } from "./searchService";
import { extractTags } from "../text_processing/tagExtractor";
import { extractKeywords } from "../text_processing/keywordExtractor";
import { newDiagnostics, Diagnostics } from "../diagnostics/diagnostics";
import { DelayedExecutor } from "../utils/delayedExecutor";
import { GoodSet } from "../utils/goodSet";
import { DeadLinkFinder } from "./DeadLinkFinder";
import { NoteSearcherConfigProvider } from "./NoteSearcherConfigProvider";

const UPDATE_RELATED_FILES_DELAY_MS = 500;

export class NoteSearcher {
  private previousQuery = '';
  private diagnostics: Diagnostics;

  constructor(
    private ui: NoteSearcherUi,
    private searcher: SearchService,
    private deadLinkFinder: DeadLinkFinder,
    private configProvider: NoteSearcherConfigProvider,
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
    this.diagnostics.trace('index');
    const folder = this.ui.currentlyOpenDir();
    if (!folder) {
      await this.ui.showNotification('open a folder first');
      this.diagnostics.trace('index: no directory open');
      return;
    }

    this.ui.showNotification('indexing current folder...');

    try {
      await this.searcher.index(folder);
      this.ui.showNotification('indexing complete');
      this.diagnostics.trace('indexing complete');
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

  public showDeadLinks = () => {
    this.diagnostics.trace('show dead links');
    const root = this.ui.currentlyOpenDir();
    if (!root) {
      this.diagnostics.trace('show dead links: no open directory');
      return;
    }

    const deadLinks = this.deadLinkFinder.findDeadLinks(root);
    if (deadLinks.length === 0) {
      this.diagnostics.trace('show dead links: no dead links');
      return;
    }

    const deadLinkMessage = deadLinks
      .map(d => `${d.sourcePath}: dead link to ${d.targetPath}`)
      .join('\n');

    this.ui.showError(new Error(deadLinkMessage));
    this.diagnostics.trace('show dead links completed');
  };

  public enable = () => {
    this.diagnostics.trace('enable');
    const currentDir = this.ui.currentlyOpenDir();

    if (!currentDir) {
      this.ui.showNotification('open a directory first!');
      return;
    }

    this.configProvider.enableInDir(currentDir);
    this.index();
  };

  public disable = () => {
    this.diagnostics.trace('disable');
    const currentDir = this.ui.currentlyOpenDir();

    if (!currentDir) {
      this.ui.showNotification('open a directory first!');
      return;
    }

    this.configProvider.disableInDir(currentDir);
  };

  public notifyExtensionActivated = () => {
    if (!this.ui.currentlyOpenDir()) { return; }

    if (this.isEnabledInCurrentDir()) {
      this.index();
      return;
    }

    this.promptUserToEnable();
  };

  public promptUserToEnable = async () => {
    const shouldEnable = await this.ui.promptToEnable();

    if (shouldEnable) { this.enable(); }
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

    if (!this.isEnabledInCurrentDir()) {
      this.diagnostics.trace('updates disabled, doing nothing');
      return;
    }

    this.delayedExecutor.cancelAll();
    this.delayedExecutor.executeInMs(UPDATE_RELATED_FILES_DELAY_MS,
      () => this.updateRelatedFiles(file));
  };

  private notifyFileSaved = (file: File) => {
    this.diagnostics.trace('file saved');

    if (!this.isEnabledInCurrentDir()) {
      this.diagnostics.trace('updates disabled, doing nothing');
      return;
    }

    this.index();
    if (this.configProvider.getConfig().deadLinks.showOnSave) {
      this.showDeadLinks();
    }
  };

  private isEnabledInCurrentDir = () => {
    const currentDir = this.ui.currentlyOpenDir();
    return currentDir && this.configProvider.isEnabledInDir(currentDir);
  };

  private searchForRelatedFiles = async (text: string) => {
    const tags = extractTags(text);
    const keywords = await extractKeywords(text);
    const query = this.createTagAndKeywordQuery(tags, keywords);

    return await this.searcher.search(query);
  };
}
