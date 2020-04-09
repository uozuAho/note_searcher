import fs = require('fs');

export interface FileReader {
  readFile: (path: string) => string;
}

export const createFileReader = (): FileReader => {
  return new NodeFileReader();
};

class NodeFileReader implements FileReader {
  public readFile = (path: string) => {
    return new String(fs.readFileSync(path)).toString();
  };
}
