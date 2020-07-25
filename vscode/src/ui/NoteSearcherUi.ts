import { File } from "../utils/File";
import { Link } from "../dead_links/DeadLinkFinder";

export interface NoteSearcherUi {
  copyToClipboard: (text: string) => Promise<void>;
  startNewNote: (path: string) => Promise<void>;
  promptForNewNoteName: (noteId: string) => Promise<string | undefined>;
  promptToEnable: () => Promise<boolean>;
  getCurrentFile: () => File | null;
  currentlyOpenDir: () => string | null;
  promptForSearch: (prefill: string) => Promise<string | undefined>;
  showSearchResults: (files: string[]) => Promise<void>;
  showNotification: (message: string) => Promise<void>;
  showDeadLinks: (links: Link[]) => Promise<void>;
  showBacklinks: (links: string[]) => Promise<void>;
  notifyIndexingStarted: (indexingTask: Promise<void>) => void;
  showError: (e: Error) => Promise<void>;
  addNoteSavedListener: (listener: FileChangeListener) => void;
  addMovedViewToDifferentNoteListener: (listener: FileChangeListener) => void;
}

export type FileChangeListener = (file: File) => Promise<void>;
