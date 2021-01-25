import { Link } from "../index/NoteLinkIndex";
import { File } from "../utils/File";

export interface NoteSearcherUi {
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
  notifyIndexingStarted: (indexingTask: Promise<void>) => void;
  showError: (e: Error) => Promise<void>;
  addNoteSavedListener: (listener: FileChangeListener) => void;
  addMovedViewToDifferentNoteListener: (listener: FileChangeListener) => void;
}

export type FileChangeListener = (file: File) => Promise<void>;
