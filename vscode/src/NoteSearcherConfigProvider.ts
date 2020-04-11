import * as vscode from 'vscode';

const EnabledDirectoriesKey = 'noteSearcher.enabledDirectories';

export class NoteSearcherConfigProvider {
  constructor(private context: vscode.ExtensionContext) {}

  public getConfig = (): NoteSearcherConfig => {
    const config = vscode.workspace.getConfiguration('noteSearcher');
    return config as unknown as NoteSearcherConfig;
  };

  public isEnabledInCurrentDir(): boolean {
    const currentDir = this.currentlyOpenDir();

    if (!currentDir) { return false; }

    return this.enabledDirs().includes(currentDir);
  }

  public enableInCurrentDir = (currentDir: string) => {
    const enabledDirs = this.enabledDirs();

    if (enabledDirs.includes(currentDir)) { return; }

    enabledDirs.push(currentDir);

    this.context.globalState.update(EnabledDirectoriesKey, enabledDirs);
  };

  public disableInCurrentDir = (currentDir: string) => {
    const enabledDirs = this
      .enabledDirs()
      .filter(d => d !== currentDir);

    this.context.globalState.update(EnabledDirectoriesKey, enabledDirs);
  };

  private currentlyOpenDir = () =>
    vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : null;

  private enabledDirs = () => this.context.globalState.get<Array<string>>(
    EnabledDirectoriesKey) ?? [];
}

export interface NoteSearcherConfig {
  deadLinks: {
    showOnSave: boolean;
  },
}
