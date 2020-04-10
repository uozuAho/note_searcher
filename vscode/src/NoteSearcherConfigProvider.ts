import * as vscode from 'vscode';

export class NoteSearcherConfigProvider {
  public getConfig = (): NoteSearcherConfig => {
    const config = vscode.workspace.getConfiguration('noteSearcher');
    return config as unknown as NoteSearcherConfig;
  };
}

export interface NoteSearcherConfig {
  deadLinks: {
    showOnSave: boolean;
  }
}
