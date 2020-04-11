import * as vscode from 'vscode';

export class NoteSearcherConfigProvider {
  constructor(private context: vscode.ExtensionContext) {}

  public getConfig = (): NoteSearcherConfig => {
    const config = vscode.workspace.getConfiguration('noteSearcher');
    return config as unknown as NoteSearcherConfig;
  };

  public isEnabledInCurrentDir(): boolean {
    const currentDir = this.currentlyOpenDir();

    if (!currentDir) { return false; }

    const enabledDirs = this.context.globalState.get<Array<string>>(
      'noteSearcher.enabledDirectories') ?? [];

    return enabledDirs.includes(currentDir);
  }

  private currentlyOpenDir = () =>
    vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : null;
}

export interface NoteSearcherConfig {
  deadLinks: {
    showOnSave: boolean;
  },
}
