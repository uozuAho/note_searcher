import * as vscode from 'vscode';

import { IDiagnostics } from "./IDiagnostics";
import { ITimeProvider } from '../utils/timeProvider';

export class VsCodeDiagnostics implements IDiagnostics {
  private _channel: vscode.OutputChannel;
  private _start: number;

  constructor(private timeProvider: ITimeProvider)
  {
    this._channel = vscode.window.createOutputChannel("NoteSearcher");
    this._start = timeProvider.millisecondsSinceEpochUtc();
  }

  public trace = (message: string) => {
    const now_ms = this.timeProvider.millisecondsSinceEpochUtc() - this._start;
    const now_s = now_ms / 1000;
    this._channel.appendLine(`${now_s}: ${message}`);
  };
}
