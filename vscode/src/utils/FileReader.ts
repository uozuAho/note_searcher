import fs = require('fs');

export interface FileReader {
  exists: (path: string) => boolean;
  readFile: (path: string) => string;
}

export const createFileReader = (): FileReader => {
  return new NodeFileReader();
};

class NodeFileReader implements FileReader {
  public readFile = (path: string) => {
    return new String(fs.readFileSync(path)).toString();
  };

  public exists = (path: string) => fs.existsSync(path);
}
