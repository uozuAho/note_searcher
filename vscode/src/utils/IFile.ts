export interface IFile {
  text: () => string;
  path: () => string;
}

export class SimpleFile implements IFile {
  constructor(private _path: string, private _text: string) { }

  public path = () => this._path;
  public text = () => this._text;
}
