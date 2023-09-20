import fs = require('graceful-fs');
import _path = require('path');
import { createDiagnostics } from '../diagnostics/diagnostics';
import { NoteSearcherConfig } from './NoteSearcherConfig';

export interface FileSystem {
  fileExists: (path: string) => boolean;
  readFile: (path: string) => string;
  readFileAsync: (path: string) => Promise<string>;
  /**
   * Return all files under the given path (recursively),
   * in the current OS's path format
   */
  allFilesUnderPath: (path: string, ignore: (path: string) => boolean) => Iterable<string>
}

export const createFileSystem = (): FileSystem => {
  return new NodeFileSystem();
};

class NodeFileSystem implements FileSystem {
  public constructor(
    private _diagnostics = createDiagnostics('FileSystem')
  ) {}

  public readFile = (path: string) => {
    return new String(fs.readFileSync(path)).toString();
  };

  public readFileAsync = (path: string): Promise<string> => {
    // DIY promise, since graceful-fs doesn't override fs.promises
    return new Promise((resolve, reject) => {
      fs.readFile(path, null, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(new String(data).toString());
      });
    });
  };

  public fileExists = (path: string) => fs.existsSync(path);

  public allFilesUnderPath = (path: string, ignore: (path: string) => boolean): Iterable<string> => {
    this._diagnostics.trace('allFilesUnderPath: start');

    const paths: string[] = [];
    walkDir(path, ignore, p => paths.push(p));

    this._diagnostics.trace('allFilesUnderPath: end');
    return paths;
  };
}

/**
 * Returns path2 relative to path1, in posix format on all platforms.
 * Input paths can be windows paths.
 */
export const posixRelativePath = (path1: string, path2: string) => {
  if (_path.extname(path1) !== '') {
    // ensure path 1 is a dir, otherwise path.relative doesn't work
    path1 = _path.dirname(path1);
  }
  let relPath = _path
    .relative(path1, path2)
    .replace(/\\/g, '/');
  if (relPath.startsWith('/')) { relPath = relPath.slice(1, relPath.length); }
  return relPath;
};

function walkDir(
  dir: string,
  ignore: (path: string) => boolean,
  callback: (path: string) => void)
{
  fs.readdirSync(dir).forEach(f => {
    const path = _path.join(dir, f);
    const isDirectory = fs.statSync(path).isDirectory();
    if (!isDirectory) {
      // todo: can ignored files end up being included here?
      //       logic below only applies to directories.
      //       Check my docs.
      callback(path);
    } else {
      if (ignore(path)) { return; }
      walkDir(path, ignore, callback);
    }
  });
};
