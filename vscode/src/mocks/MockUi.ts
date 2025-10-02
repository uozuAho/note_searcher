import * as tmoq from "typemoq";
import { Link } from "../index/LinkIndex";
import { INoteSearcherUi, FileChangeListener, FileDeletedListener, FileMovedListener, FileRenamedListener } from "../ui/INoteSearcherUi";
import { IFile } from "../utils/IFile";
import { MockFile } from "./MockFile";

export class MockUi implements INoteSearcherUi {
  private _mock: tmoq.IMock<INoteSearcherUi>;

  constructor() {
    this._mock = tmoq.Mock.ofType<INoteSearcherUi>();
  }

  public openFile(path: any) {
    throw new Error("Method not implemented.");
  }

  public showTags = (tags: string[]) => Promise.resolve();

  public showBacklinks = (links: string[]) => Promise.resolve();

  public showForwardLinks = (links: string[]) => Promise.resolve();

  public addMovedViewToDifferentNoteListener = (listener: FileChangeListener) => {};

  public copyToClipboard = (text: string) => Promise.resolve();

  public promptForNewNoteName = (noteId: string) => Promise.resolve('asdf');

  public startNewNote = (noteName: string) => Promise.resolve();

  private _currentFile: IFile | null = null;

  public getCurrentFileReturns = (file: IFile | null) => {
    this._currentFile = file;
  };

  public getCurrentFile = () => this._currentFile;

  private _currentlyOpenDir: string | null = null;

  public currentlyOpenDirReturns = (dir: string | null) => {
    this._currentlyOpenDir = dir;
  };

  public currentlyOpenDir = () => this._currentlyOpenDir;

  private _searchInput: string | undefined;

  public promptForSearchReturns = (input: string | undefined) => {
    this._searchInput = input;
  };

  public promptForSearch = (prefill: string) => Promise.resolve(this._searchInput);

  public showSearchResults = async (files: string[]) => {
    await this._mock.object.showSearchResults(files);
  };

  public showedSearchResults = (files: string[]) => {
    this._mock.verify(m => m.showSearchResults(files), tmoq.Times.once());
  };

  public didNotShowSearchResults = () => {
    this._mock.verify(m => m.showSearchResults(tmoq.It.isAny()), tmoq.Times.never());
  };

  public showDeadLinks = async (links: Link[]) => {
    return await this._mock.object.showDeadLinks(links);
  };

  public showedDeadLinks() {
    this._mock.verify(m => m.showDeadLinks(tmoq.It.isAny()), tmoq.Times.once());
  }

  public didNotShowDeadLinks() {
    this._mock.verify(m => m.showDeadLinks(tmoq.It.isAny()), tmoq.Times.never());
  }

  public showNotification = async (message: string) => {
    await this._mock.object.showNotification(message);
  };

  public showedAnyNotification = (times: number = 1) => {
    this._mock.verify(m => m.showNotification(tmoq.It.isAnyString()), tmoq.Times.exactly(times));
  };

  public notifyIndexingStarted = (indexingTask: Promise<void>) => {
    this._mock.object.notifyIndexingStarted(indexingTask);
  };

  public notifiedIndexingStarted = () => {
    this._mock.verify(m => m.notifyIndexingStarted(tmoq.It.isAny()), tmoq.Times.once());
  };

  public showError = async (e: any) => {
    await this._mock.object.showError(e);
  };

  public showedError = (error?: Error) => {
    if (!error) {
      this._mock.verify(m => m.showError(tmoq.It.isAny()), tmoq.Times.once());
    } else {
      this._mock.verify(m => m.showError(error), tmoq.Times.once());
    }
  };

  public didNotShowError = () => {
    this._mock.verify(m => m.showError(tmoq.It.isAny()), tmoq.Times.never());
  };

  private _fileSavedListener: FileChangeListener | null = null;

  public addNoteSavedListener = (listener: FileChangeListener) => {
    this._fileSavedListener = listener;
  };

  public addNoteDeletedListener = (listener: FileDeletedListener) => {
    return;
  };

  public addNoteMovedListener = (listener: FileMovedListener) => {};

  public addNoteRenamedListener = (listener: FileRenamedListener) => {};

  public saveFile = async (file: MockFile) => {
    if (this._fileSavedListener) {
      await this._fileSavedListener(file);
    }
  };

  public createMovedViewToDifferentNoteHandler = () => { return { dispose: () => {} };};
  public createNoteDeletedHandler = () => { return { dispose: () => {} };};
  public createNoteSavedHandler = () => { return { dispose: () => {} };};
  public createNoteMovedHandler = () => { return { dispose: () => {} };};
}
