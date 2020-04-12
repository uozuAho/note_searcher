import { File } from "../utils/File";

export interface NoteSearcherUi {
  promptToEnable: () => Promise<boolean>;
  getCurrentFile: () => File | null;
  currentlyOpenDir: () => string | null;
  promptForSearch: (prefill: string) => Promise<string | undefined>;
  showSearchResults: (files: string[]) => Promise<void>;
  showRelatedFiles: (files: string[]) => void;
  showNotification: (message: string) => Promise<void>;
  showError: (e: Error) => Promise<void>;
  addCurrentDocumentChangeListener: (listener: FileChangeListener) => void;
  addDocumentSavedListener: (listener: FileChangeListener) => void;
}

export type FileChangeListener = (file: File) => void;
