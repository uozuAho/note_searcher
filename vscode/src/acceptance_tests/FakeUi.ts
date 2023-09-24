import { Link } from "../index/LinkIndex";
import { FileChangeListener, FileDeletedListener, FileMovedListener, NoteSearcherUi } from "../ui/NoteSearcherUi";
import { File } from "../utils/File";

class FakeFile implements File {
  constructor(private _path: string, private _text: string) { }
  text = () => this._text;
  path = () => this._path;
}

export class FakeUi implements NoteSearcherUi {
  // UI interface
  public openFile = (path: any) => { };
  public showTags = (tags: string[]) => { };
  public copyToClipboard = (text: string) => Promise.resolve();
  public startNewNote = (path: string) => Promise.resolve();
  public promptForNewNoteName = (noteId: string) => Promise.resolve(noteId);
  public getCurrentFile = () => this._currentlyOpenFile ? new FakeFile(this._currentlyOpenFile, '') : null;
  public currentlyOpenDir = () => this._currentlyOpenDir;
  public promptForSearch = (prefill: string) => Promise.resolve(this._searchInput);
  public showSearchResults = (files: string[]) => {
    this._searchResults = files;
    return Promise.resolve();
  };
  public showNotification = (message: string) => Promise.resolve();
  public showDeadLinks = (links: Link[]) => this._deadLinks = links;
  public showBacklinks = (links: string[]) => this._backlinks = links;
  public showForwardLinks = (links: string[]) => this._forwardLinks = links;
  public notifyIndexingStarted = (indexingTask: Promise<void>) => { };
  public showError = (e: Error) => Promise.resolve();
  public addNoteSavedListener = (listener: FileChangeListener) => { };
  public addNoteDeletedListener = (listener: FileDeletedListener) => { this._noteDeletedListener = listener; };
  public addMovedViewToDifferentNoteListener = (listener: FileChangeListener) => {
    this._movedViewToDifferentNoteListener = listener;
  };
  public createNoteSavedHandler = () => { return { dispose: () => { } }; };
  public createNoteDeletedHandler = () => { return { dispose: () => { } }; };
  public createMovedViewToDifferentNoteHandler = () => { return { dispose: () => { } }; };
  // end UI interface

  private _currentlyOpenDir: string | null = null;
  private _currentlyOpenFile: string | null = null;
  private _searchInput: string | undefined;
  private _searchResults: string[] = [];
  private _backlinks: string[] = [];
  private _forwardLinks: string[] = [];
  private _deadLinks: Link[] = [];
  private _movedViewToDifferentNoteListener: FileChangeListener | null = null;
  private _noteDeletedListener: FileDeletedListener | null = null;
  private _noteMovedListener: FileMovedListener | null = null;

  // queries
  public searchResults = () => this._searchResults;
  public linksToThisNote = () => this._backlinks;
  public linksFromThisNote = () => this._forwardLinks;
  public deadLinks = () => this._deadLinks;
  // commands
  public openFolder = (path: string) => this._currentlyOpenDir = path;
  public setSearchInput = (query: string) => this._searchInput = query;
  public moveViewToNote = (file: string) => {
    if (this._movedViewToDifferentNoteListener) {
      this._currentlyOpenFile = file;
      return this._movedViewToDifferentNoteListener(new FakeFile(file, ''));
    }
  };
  public notifyNoteDeleted = (path: string) => {
    if (this._noteDeletedListener) {
      return this._noteDeletedListener(path);
    }
  };

  public notifyNoteMoved(oldPath: string, newPath: string) {
    if (this._noteMovedListener) {
      return this._noteMovedListener(oldPath, newPath);
    }
  }
}
