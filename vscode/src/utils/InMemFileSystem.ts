import { FileSystem } from './FileSystem';

interface File {
  path: string;
  text: string;
}

export class InMemFileSystem implements FileSystem {

  private _files: Map<string, string> = new Map();

  /**
   * Return a FakeFs that contains all files under the given root
   */
  public static fromFs(root: string, fs: FileSystem) {
    const newFs = new InMemFileSystem();
    for (const path of fs.allFilesUnderPath(root, () => false)) {
      newFs.writeFile(path, fs.readFile(path));
    }
    return newFs;
  }

  public static fromFiles(files: File[]): FileSystem {
    const newFs = new InMemFileSystem();
    for (const file of files) {
      newFs.writeFile(file.path, file.text);
    }
    return newFs;
  }

  public fileExists = (path: string) => this._files.has(path);
  public readFileAsync = (path: string) => Promise.resolve(this.readFile(path));
  public writeFile = (path: string, text: string) => this._files.set(path, text);
  public deleteFile = (path: string) => this._files.delete(path);

  public readFile = (path: string) => {
    const text = this._files.get(path);
    if (!text) {
      throw new Error(`file not found: ${path}`);
    }
    return text;
  };

  public moveFile = (oldPath: string, newPath: string) => {
    const text = this.readFile(oldPath);
    this.deleteFile(oldPath);
    this.writeFile(newPath, text);
  };

  public allFilesUnderPath = (path: string) => {
    const files = [];
    for (const path of this._files.keys()) {
      if (path.startsWith(path)) {
        files.push(path);
      }
    }
    return files;
  };
}
