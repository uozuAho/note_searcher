import { IFile } from "../utils/IFile";

export class MockFile implements IFile {
  constructor(private _path: string, private _text: string) { }

  public path = () => this._path;
  public text = () => this._text;
}
