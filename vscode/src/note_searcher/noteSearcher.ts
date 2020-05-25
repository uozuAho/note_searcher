const path = require('path');

import { NoteSearcherUi } from "../ui/NoteSearcherUi";
import { File } from "../utils/File";
import { NoteIndex } from "../index/NoteIndex";
import { extractTags } from "../text_processing/tagExtractor";
import { extractKeywords } from "../text_processing/keywordExtractor";
import { createDiagnostics, Diagnostics } from "../diagnostics/diagnostics";
import { DelayedExecutor } from "../utils/delayedExecutor";
import { GoodSet } from "../utils/goodSet";
import { DeadLinkFinder } from "../dead_links/DeadLinkFinder";
import { NoteSearcherConfigProvider } from "./NoteSearcherConfigProvider";
import { TimeProvider, createTimeProvider } from "../utils/timeProvider";
import { formatDateTime_YYYYMMddhhmm } from "../utils/timeFormatter";
import { relativePath } from "../utils/FileSystem";

const UPDATE_RELATED_FILES_DELAY_MS = 500;

export class NoteSearcher {
  private previousQuery = '';
  private diagnostics: Diagnostics;

  constructor(
    private ui: NoteSearcherUi,
    private noteIndex: NoteIndex,
    private deadLinkFinder: DeadLinkFinder,
    private configProvider: NoteSearcherConfigProvider,
    private delayedExecutor: DelayedExecutor = new DelayedExecutor(),
    private timeProvider: TimeProvider = createTimeProvider())
  {
    ui.addCurrentDocumentChangeListener(this.notifyCurrentFileChanged);
    ui.addDocumentSavedListener(this.notifyFileSaved);
    this.diagnostics = createDiagnostics('noteSearcher');
  }

  public search = async () => {
    this.diagnostics.trace('search');

    const input = await this.ui.promptForSearch(this.previousQuery);
    if (!input) {
      return;
    }
    this.previousQuery = input;
    try {
      const results = await this.noteIndex.search(input);
      await this.ui.showSearchResults(results);

      this.diagnostics.trace('search complete');
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
      await this.noteIndex.index(folder);
      this.ui.showNotification('indexing complete');
      this.diagnostics.trace('indexing complete');
    }
    catch (e) {
      await this.ui.showError(e);
    }
  };

  public createNote = async () => {
    const noteId = this.createNoteId();
    const noteName = await this.ui.promptForNewNoteName(noteId);
    if (!noteName) { return; }
    const notePath = this.createNotePath(noteName);
    this.ui.startNewNote(notePath);
  };

  public createNoteId = (): string => {
    const now = this.timeProvider.millisecondsSinceEpochLocal();
    return formatDateTime_YYYYMMddhhmm(now);
  };

  private createNotePath = (name: string) => {
    const activeFile = this.ui.getCurrentFile();
    const dir = activeFile
      ? path.dirname(activeFile.path())
      : this.ui.currentlyOpenDir();
    return path.join(dir, name);
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

  public markdownLinkToClipboard = (filePath: string) => {
    const link = this.generateMarkdownLinkTo(filePath);
    this.ui.copyToClipboard(link);
  };

  public generateMarkdownLinkTo = (filePath: string) => {
    const currentFilePath = this.ui.getCurrentFile()?.path();

    let relPath = currentFilePath
      ? relativePath(currentFilePath, filePath)
      : path.basename(filePath);

    return `[](${relPath})`;
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

    return await this.noteIndex.search(query);
  };
}
