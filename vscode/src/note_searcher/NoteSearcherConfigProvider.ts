import * as vscode from 'vscode';

export class NoteSearcherConfigProvider {
  constructor(private context: vscode.ExtensionContext) {}

  public getConfig = (): NoteSearcherConfig => {
    const config = vscode.workspace.getConfiguration('noteSearcher');
    return config as unknown as NoteSearcherConfig;
  };
}

export interface NoteSearcherConfig {}
