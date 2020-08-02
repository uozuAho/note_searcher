import * as vscode from 'vscode';

const EnabledDirectoriesKey = 'noteSearcher.enabledDirectories';

export class NoteSearcherConfigProvider {
  constructor(private context: vscode.ExtensionContext) {}

  public getConfig = (): NoteSearcherConfig => {
    const config = vscode.workspace.getConfiguration('noteSearcher');
    return config as unknown as NoteSearcherConfig;
  };

  public isEnabledInDir(dir: string): boolean {
    return this.enabledDirs().includes(dir);
  }

  public enableInDir = (dir: string) => {
    const enabledDirs = this.enabledDirs();

    if (enabledDirs.includes(dir)) { return; }

    enabledDirs.push(dir);

    this.context.globalState.update(EnabledDirectoriesKey, enabledDirs);
  };

  public disableInDir = (dir: string) => {
    const enabledDirs = this
      .enabledDirs()
      .filter(d => d !== dir);

    this.context.globalState.update(EnabledDirectoriesKey, enabledDirs);
  };

  private enabledDirs = () => this.context.globalState.get<Array<string>>(
    EnabledDirectoriesKey) ?? [];
}

export interface NoteSearcherConfig {
  search: {
    useLucene: boolean
  },
}
