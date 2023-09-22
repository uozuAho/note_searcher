import { Link } from "../index/LinkIndex";
import { FileChangeListener, FileDeletedListener, NoteSearcherUi } from "../ui/NoteSearcherUi";

export class FakeUi implements NoteSearcherUi {
  // UI interface
  public openFile = (path: any) => { };
  public showTags = (tags: string[]) => { };
  public copyToClipboard = (text: string) => Promise.resolve();
  public startNewNote = (path: string) => Promise.resolve();
  public promptForNewNoteName = (noteId: string) => Promise.resolve(noteId);
  public getCurrentFile = () => null;
  public currentlyOpenDir = () => this._currentlyOpenDir;
  public promptForSearch = (prefill: string) => Promise.resolve(this._searchInput);
  public showSearchResults = (files: string[]) => {
    this._searchResults = files;
    return Promise.resolve();
  };
  public showNotification = (message: string) => Promise.resolve();
  public showDeadLinks = (links: Link[]) => { };
  public showBacklinks = (links: string[]) => { };
  public showForwardLinks = (links: string[]) => { };
  public notifyIndexingStarted = (indexingTask: Promise<void>) => { };
  public showError = (e: Error) => Promise.resolve();
  public addNoteSavedListener = (listener: FileChangeListener) => { };
  public addNoteDeletedListener = (listener: FileDeletedListener) => { };
  public addMovedViewToDifferentNoteListener = (listener: FileChangeListener) => { };
  public createNoteSavedHandler = () => { return { dispose: () => { } }; };
  public createNoteDeletedHandler = () => { return { dispose: () => { } }; };
  public createMovedViewToDifferentNoteHandler = () => { return { dispose: () => { } }; };
  // end UI interface
  private _currentlyOpenDir: string | null = null;
  private _searchInput: string | undefined;
  private _searchResults: string[] = [];

  public openFolder = (path: string) => this._currentlyOpenDir = path;
  public setSearchInput = (query: string) => this._searchInput = query;
  public searchResults = () => this._searchResults;
}
