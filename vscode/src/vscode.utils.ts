import * as vscode from 'vscode';

export async function openInNewEditor(content: string, language?: string) {
    const document = await vscode.workspace.openTextDocument({
        language,
        content,
    });
    return await vscode.window.showTextDocument(document);
}

export function openInNewOutputChannel(
    content: string,
    channelName: string = 'note searcher')
{
    const output = vscode.window.createOutputChannel(channelName);
    output.show();
    output.append(content);
}
