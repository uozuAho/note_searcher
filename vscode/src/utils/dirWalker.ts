import fs = require('fs');
import _path = require('path');

export interface DirWalker {
  allFilesUnderPath(path: string): Iterable<string>
}

export const createDirWalker = (): DirWalker => {
  return new NodeDirWalker();
};

class NodeDirWalker implements DirWalker {
  allFilesUnderPath(path: string): Iterable<string> {
    const paths: string[] = [];
    walkDir(path, p => paths.push(p));
    return paths;
  }
}

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = _path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ?
      walkDir(dirPath, callback) : callback(_path.join(dir, f));
  });
};
