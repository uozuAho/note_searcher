interface Disposable {
  dispose(): any;
}

interface VsCodeRegistry {
  registerCommand(name: string, callback: (...args: any[]) => any): Disposable;
  registerCompletionItemProvider(selector: string[], provider: any, triggerChars: string[]): Disposable;
  registerDefinitionProvider(selector: string[], provider: any): Disposable;
}
