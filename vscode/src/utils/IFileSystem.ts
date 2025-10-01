export interface IFileSystem {
  fileExists: (path: string) => boolean;
  readFile: (path: string) => string;
  readFileAsync: (path: string) => Promise<string>;
  writeFile(path: string, text: string): void;
  deleteFile(path: string): void;
  moveFile(oldPath: string, newPath: string): void;
  /**
   * Return all files under the given path (recursively),
   * in the current OS's path format
   */
  allFilesUnderPath: (path: string, ignore?: (path: string) => boolean) => Iterable<string>;
}
