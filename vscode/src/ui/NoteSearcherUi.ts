export interface NoteSearcherUi {
  getCurrentFile: () => File | null;
  currentlyOpenDir: () => string | null;
  promptForSearch: (prefill: string) => Promise<string | undefined>;
  showSearchResults: (files: string[]) => Promise<void>;
  showNotification: (message: string) => Promise<void>;
  showError: (e: any) => Promise<void>;
  addCurrentDocumentChangeListener: (listener: FileChangeListener) => void;
  showRelatedFiles: (files: string[]) => Promise<void>;
}

export interface File {
  text: () => string;
  path: () => string;
}

export type FileChangeListener = (file: File) => Promise<void>;
