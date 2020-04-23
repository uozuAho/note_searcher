import fs = require('fs');
import _path = require('path');
import { createDiagnostics } from '../diagnostics/diagnostics';

export interface FileSystem {
  fileExists: (path: string) => boolean;
  readFile: (path: string) => string;
  readFileAsync: (path: string) => Promise<string>;
  allFilesUnderPath: (path: string) => Iterable<string>
}

export const createFileSystem = (): FileSystem => {
  return new NodeFileSystem();
};

class NodeFileSystem implements FileSystem {
  private diagnostics = createDiagnostics('FileSystem');

  public readFile = (path: string) => {
    return new String(fs.readFileSync(path)).toString();
  };

  public readFileAsync = (path: string) => {
    return fs.promises.readFile(path)
      .then(contents => new String(contents).toString());
  };

  public fileExists = (path: string) => fs.existsSync(path);

  public allFilesUnderPath = (path: string): Iterable<string> => {
    this.diagnostics.trace('allFilesUnderPath: start');

    const paths: string[] = [];
    walkDir(path, p => paths.push(p));

    this.diagnostics.trace('allFilesUnderPath: end');
    return paths;
  };
}

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = _path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ?
      walkDir(dirPath, callback) : callback(_path.join(dir, f));
  });
};
