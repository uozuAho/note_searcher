import * as vscode from 'vscode';

export function createVsCodeRegistry() {
  return new RealVsCodeRegistry();
}

class RealVsCodeRegistry implements VsCodeRegistry {
  public registerCommand(name: string, callback: (...args: any[]) => any) {
    return vscode.commands.registerCommand(name, callback);
  }

  public registerCompletionItemProvider(selector: string[], provider: any, triggerChars: string[]) {
    return vscode.languages.registerCompletionItemProvider(selector, provider, ...triggerChars);
  }

  public registerDefinitionProvider(selector: string[], provider: any) {
    return vscode.languages.registerDefinitionProvider(selector, provider);
  }
}
