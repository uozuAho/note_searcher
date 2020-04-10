import { File } from "../utils/File";

export class MockFile implements File {
  constructor(private _text: string, private _path: string) { }

  public text = () => this._text;
  public path = () => this._path;
}
