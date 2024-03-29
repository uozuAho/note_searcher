import { Link } from "../index/LinkIndex";
import { File } from "../utils/File";

export interface NoteSearcherUi {
  openFile(path: any): any;
  showTags: (tags: string[]) => void;
  copyToClipboard: (text: string) => Promise<void>;
  startNewNote: (path: string) => Promise<void>;
  promptForNewNoteName: (noteId: string) => Promise<string | undefined>;
  getCurrentFile: () => File | null;
  currentlyOpenDir: () => string | null;
  promptForSearch: (prefill: string) => Promise<string | undefined>;
  showSearchResults: (files: string[]) => Promise<void>;
  showNotification: (message: string) => Promise<void>;
  showDeadLinks: (links: Link[]) => void;
  showBacklinks: (links: string[]) => void;
  showForwardLinks: (links: string[]) => void;
  notifyIndexingStarted: (indexingTask: Promise<void>) => void;
  showError: (e: Error) => Promise<void>;
  addNoteSavedListener: (listener: FileChangeListener) => void;
  addNoteDeletedListener: (listener: FileDeletedListener) => void;
  addNoteMovedListener: (listener: FileMovedListener) => void;
  addMovedViewToDifferentNoteListener: (listener: FileChangeListener) => void;
  createMovedViewToDifferentNoteHandler(): Disposable;
  createNoteDeletedHandler(): Disposable;
  createNoteSavedHandler(): Disposable;
  createNoteMovedHandler(): Disposable;
}

type Disposable = { dispose(): any; };
export type FileChangeListener = (file: File) => Promise<void>;
export type FileDeletedListener = (path: string) => Promise<void>;
export type FileMovedListener = (oldPath: string, newPath: string) => Promise<void>;
