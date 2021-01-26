import fs = require('fs');
import _path = require('path');
import { createDiagnostics } from '../diagnostics/diagnostics';

export interface FileSystem {
  fileExists: (path: string) => boolean;
  readFile: (path: string) => string;
  readFileAsync: (path: string) => Promise<string>;
  /**
   * Return all files under the given path, in the current OS's
   * path format
   */
  allFilesUnderPath: (path: string) => Iterable<string>
}

interface FileSystemOptions {
  ignore: string[];
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

  public readFileAsync = (path: string) => {
    return fs.promises.readFile(path)
      .then(contents => new String(contents).toString());
  };

  public fileExists = (path: string) => fs.existsSync(path);

  public allFilesUnderPath = (path: string): Iterable<string> => {
    this._diagnostics.trace('allFilesUnderPath: start');
    let options = {ignore: ['node_modules']};

    const optionsFilePath = _path.join(path, '.noteSearcher.config.json');
    if (this.fileExists(optionsFilePath)) {
      const optionsFromFile = this.readOptionsFromFile(optionsFilePath);
      options = this.mergeOptions(options, optionsFromFile);
    }
    const paths: string[] = [];
    const ignorePatterns = extractPatternsToIgnore(options.ignore);
    const ignoreDirs = extractDirsToIgnore(path, options.ignore);
    walkDir(path, ignorePatterns, ignoreDirs, p => paths.push(p));

    this._diagnostics.trace('allFilesUnderPath: end');
    return paths;
  };

  private readOptionsFromFile = (path: string): FileSystemOptions => {
    return JSON.parse(this.readFile(path));
  }

  private mergeOptions(
    options1: FileSystemOptions,
    options2: FileSystemOptions): FileSystemOptions
  {
    return {
      ignore: Array.from(new Set(options1.ignore.concat(options2.ignore)))
    }
  }
}

function extractPatternsToIgnore(ignores: string[]) {
  return ignores.filter(i => !isRelativePattern(i));
}

function extractDirsToIgnore(path: string, ignores: string[]) {
  return ignores
    .filter(i => isRelativePattern(i))
    .map(i => _path.resolve(_path.join(path, i)));
}

function isRelativePattern(pattern: string) {
  return pattern.includes('/');
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
  ignorePatterns: string[],
  ignoreDirs: string[],
  callback: (path: string) => void)
{
  fs.readdirSync(dir).forEach(f => {
    const path = _path.join(dir, f);
    const isDirectory = fs.statSync(path).isDirectory();
    if (!isDirectory) {
      callback(path);
    } else {
      if (any(ignorePatterns, i => path.includes(i))) {
        return;
      }
      if (any(ignoreDirs, i => i === path)) {
        return;
      }
      walkDir(path, ignorePatterns, ignoreDirs, callback);
    }
  });
};

function any(arr: any[], predicate: (a: any) => boolean) {
  for (const item of arr) {
    if (predicate(item)) {
      return true;
    }
  }
  return false;
}
