import fs = require('fs');

export interface FileSystem {
  fileExists: (path: string) => boolean;
  readFile: (path: string) => string;
}

export const createFileSystem = (): FileSystem => {
  return new NodeFileSystem();
};

class NodeFileSystem implements FileSystem {
  public readFile = (path: string) => {
    return new String(fs.readFileSync(path)).toString();
  };

  public fileExists = (path: string) => fs.existsSync(path);
}
