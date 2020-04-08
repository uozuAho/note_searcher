export interface NoteSearcherUi {
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

export interface File {
  text: () => string;
  path: () => string;
}

export type FileChangeListener = (file: File) => void;
