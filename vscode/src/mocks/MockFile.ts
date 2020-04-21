import { File } from "../utils/File";

export class MockFile implements File {
  constructor(private _path: string, private _text: string) { }

  public path = () => this._path;
  public text = () => this._text;
}
