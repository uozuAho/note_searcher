import { FakeVsCodeNoteSearcher } from "./FakeVsCodeNoteSearcher";

export class FakeVsCodeRegistry implements VsCodeRegistry {
  constructor(private vscode: FakeVsCodeNoteSearcher) { }

  public registerCommand = (command: string, callback: any) => {
    return this.vscode.registerCommand(command, callback);
  };

  public registerCompletionItemProvider = (
    selector: string[],
    provider: any,
    triggerChars: string[]) => {
    return {
      dispose: () => { },
      [Symbol.dispose]: () => { }
    };
  };

  public registerDefinitionProvider = (selector: string[], provider: any) => {
    return {
      dispose: () => { },
      [Symbol.dispose]: () => { }
    };
  };
}
