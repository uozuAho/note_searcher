import { File } from "../utils/File";

export interface NoteSearcherUi {
  copyToClipboard: (text: string) => Promise<void>;
  startNewNote: (path: string) => Promise<void>;
  promptForNewNoteName: (noteId: string) => Promise<string | undefined>;
  promptToEnable: () => Promise<boolean>;
  getCurrentFile: () => File | null;
  currentlyOpenDir: () => string | null;
  promptForSearch: (prefill: string) => Promise<string | undefined>;
  showSearchResults: (files: string[]) => Promise<void>;
  showRelatedFiles: (files: string[]) => void;
  showNotification: (message: string) => Promise<void>;
  showDeadLinks: (message: string) => Promise<void>;
  notifyIndexingStarted: (indexingTask: Promise<void>) => void;
  showError: (e: Error) => Promise<void>;
  addCurrentDocumentChangeListener: (listener: FileChangeListener) => void;
  addDocumentSavedListener: (listener: FileChangeListener) => void;
}

export type FileChangeListener = (file: File) => Promise<void>;
