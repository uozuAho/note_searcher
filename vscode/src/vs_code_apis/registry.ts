interface MyDisposable {
  dispose(): any;
}

interface VsCodeRegistry {
  registerCommand(name: string, callback: (...args: any[]) => any): MyDisposable;
  registerCompletionItemProvider(selector: string[], provider: any, triggerChars: string[]): MyDisposable;
  registerDefinitionProvider(selector: string[], provider: any): MyDisposable;
}
