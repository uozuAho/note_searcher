interface IMyDisposable {
  dispose(): any;
}

interface IVsCodeRegistry {
  registerCommand(name: string, callback: (...args: any[]) => any): IMyDisposable;
  registerCompletionItemProvider(selector: string[], provider: any, triggerChars: string[]): IMyDisposable;
  registerDefinitionProvider(selector: string[], provider: any): IMyDisposable;
}
