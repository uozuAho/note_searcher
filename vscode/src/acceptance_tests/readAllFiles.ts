import fs = require('graceful-fs');
import _path = require('path');
import { IFile } from '../utils/IFile';

class File implements IFile {
  private _path: string;
  private _text: string;

  constructor(path: string, text: string) {
    this._path = path;
    this._text = text;
  }

  public path() { return this._path; }
  public text() { return this._text; }
}

export function allFilesUnderPath(path: string) {
  const paths: IFile[] = [];
  walkDir(path, p => paths.push(readFile(p)));
  return paths;
};

function readFile(path: string) {
  const text = fs.readFileSync(path, 'utf8');
  return new File(path, text);
}

function walkDir(dir: string, callback: (path: string) => void)
{
  fs.readdirSync(dir).forEach(f => {
    const path = _path.join(dir, f);
    const isDirectory = fs.statSync(path).isDirectory();
    if (isDirectory) {
      walkDir(path, callback);
    } else {
      callback(path);
    }
  });
};
