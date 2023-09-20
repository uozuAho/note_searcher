const path = require('path');

import { NoteSearcherUi } from "../ui/NoteSearcherUi";
import { File } from "../utils/File";
import { MultiIndex } from "../index/MultiIndex";
import { createDiagnostics, Diagnostics } from "../diagnostics/diagnostics";
import { TimeProvider, createTimeProvider } from "../utils/timeProvider";
import { formatDateTime_YYYYMMddhhmm } from "../utils/timeFormatter";
import { posixRelativePath } from "../utils/FileSystem";

export class NoteSearcher {
  private previousSearchInput = '';
  private diagnostics: Diagnostics;

  constructor(
    private ui: NoteSearcherUi,
    private index: MultiIndex,
    private timeProvider: TimeProvider = createTimeProvider())
  {
    ui.addNoteSavedListener(this.notifyNoteSaved);
    ui.addMovedViewToDifferentNoteListener(this.notifyMovedViewToDifferentNote);
    this.diagnostics = createDiagnostics('noteSearcher');
  }

  public promptAndSearch = async () => {
    const input = await this.ui.promptForSearch(this.previousSearchInput);

    if (!input) { return; }

    this.previousSearchInput = input;

    await this.search(input);
  };

  public search = async (query: string) => {
    try {
      const results = await this.index.fullTextSearch(query);
      await this.ui.showSearchResults(results);
    }
    catch (e) {
      if (e instanceof Error) {
        await this.ui.showError(e);
      } else {
        const ee = Error("unknown error: " + JSON.stringify(e));
        await this.ui.showError(ee);
      }
    }
  };

  public indexWorkspace = async () => {
    this.diagnostics.trace('index');
    const folder = this.ui.currentlyOpenDir();
    if (!folder) {
      await this.ui.showNotification('Note searcher: I only work once you have opened a folder/workspace');
      this.diagnostics.trace('index: no directory open');
      return;
    }

    try {
      const indexingTask = this.index.indexAllFiles(folder);
      this.ui.notifyIndexingStarted(indexingTask);
      await indexingTask;
      this.diagnostics.trace('indexing complete');
    }
    catch (e) {
      if (e instanceof Error) {
        await this.ui.showError(e);
      } else {
        const ee = Error("unknown error: " + JSON.stringify(e));
        await this.ui.showError(ee);
      }
    }
  };

  public createNote = async () => {
    const noteId = this.createNoteId();
    const noteName = await this.ui.promptForNewNoteName(noteId);
    if (!noteName) { return; }
    const notePath = this.createNotePath(noteName);
    return this.ui.startNewNote(notePath);
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

  public showDeadLinks = () => {
    this.diagnostics.trace('show dead links');
    const root = this.ui.currentlyOpenDir();
    if (!root) {
      return;
    }

    const deadLinks = this.index.findAllDeadLinks();

    this.ui.showDeadLinks(deadLinks);
    this.diagnostics.trace('show dead links completed');
  };

  public notifyExtensionActivated = async () => {
    if (!this.ui.currentlyOpenDir()) { return; }
    await this.indexWorkspace();
    this.showTags();
    this.showDeadLinks();
  };

  public markdownLinkToClipboard = (filePath: string) => {
    const link = this.generateMarkdownLinkTo(filePath);
    return this.ui.copyToClipboard(link);
  };

  public generateMarkdownLinkTo = (filePath: string) => {
    const currentFilePath = this.ui.getCurrentFile()?.path();

    let relPath = currentFilePath
      ? posixRelativePath(currentFilePath, filePath)
      : path.basename(filePath);

    return `[](${relPath})`;
  };

  public wikiLinkToClipboard = (filePath: string) => {
    const link = this.generateWikiLinkTo(filePath);
    return this.ui.copyToClipboard(link);
  };

  public generateWikiLinkTo = (filePath: string) => {
    const filename = path.parse(filePath).name;

    return `[[${filename}]]`;
  };

  public showBacklinks = () => {
    const currentFilePath = this.ui.getCurrentFile()?.path();
    if (!currentFilePath) { return; }
    const backlinks = this.index.linksTo(currentFilePath);
    this.ui.showBacklinks(backlinks);
  };

  public showForwardLinks = () => {
    const currentFilePath = this.ui.getCurrentFile()?.path();
    if (!currentFilePath) { return; }
    const links = this.index.linksFrom(currentFilePath);
    this.ui.showForwardLinks(links);
  };

  private showTags = () => {
    const tags = this.index.allTags();
    this.ui.showTags(tags);
  };

  private notifyNoteSaved = async (file: File) => {
    this.diagnostics.trace('note saved');

    await this.index.onFileModified(file.path(), file.text());
    this.showDeadLinks();
    this.showTags();
  };

  private notifyMovedViewToDifferentNote = async (file: File) => {
    this.showBacklinks();
    this.showForwardLinks();
  };
}
