import * as tmoq from "typemoq";
import { NoteSearcherUi, File, FileChangeListener } from "../ui/NoteSearcherUi";

export class MockUi implements NoteSearcherUi {

  private _mock: tmoq.IMock<NoteSearcherUi>;

  constructor() {
    this._mock = tmoq.Mock.ofType<NoteSearcherUi>();
  }

  private _currentFile: File | null = null;

  public getCurrentFileReturns = (file: File | null) => {
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

  public showNotification = async (message: string) => {
    await this._mock.object.showNotification(message);
  };

  public showedAnyNotification = async (times: number = 1) => {
    this._mock.verify(m => m.showNotification(tmoq.It.isAnyString()), tmoq.Times.exactly(times));
  };

  public showError = async (e: any) => {
    await this._mock.object.showError(e);
  };

  public showedError = (error: Error) => {
    this._mock.verify(m => m.showError(error), tmoq.Times.once());
  };

  public addCurrentDocumentChangeListener = (listener: FileChangeListener) => { };
}
