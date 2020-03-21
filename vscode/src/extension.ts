import * as path from 'path';
import * as vscode from 'vscode';
import { newCliSearcher } from './search';

export function activate(context: vscode.ExtensionContext) {
	const searcher = newCliSearcher(path.join(extensionDir()!, 'out/note_searcher.jar'));

	let search = vscode.commands.registerCommand('extension.search', async () => {
		const input = await vscode.window.showInputBox({
			prompt: "Search for documents"
		});
		if (!input) {
			return;
		}
		try {
			const result = await searcher.search(input);
			openInNewEditor(result);
		}
		catch (e) {
			openInNewEditor(e);
		}
	});
	context.subscriptions.push(search);

	let index = vscode.commands.registerCommand('extension.index', async () => {
		const folders = vscode.workspace.workspaceFolders;

		if (!folders) {
			vscode.window.showErrorMessage(
				'open a folder in vscode for indexing to work');
			return;
		}

		vscode.window.showInformationMessage('indexing current folder...');

		try {
			await searcher.index(folders[0].uri.fsPath);
			vscode.window.showInformationMessage('indexing complete');
		}
		catch (e) {
			openInNewEditor(e);
		}
	});
	context.subscriptions.push(index);
}

export function deactivate() {}

async function openInNewEditor(content: string, language?: string) {
    const document = await vscode.workspace.openTextDocument({
        language,
        content,
    });
    return await vscode.window.showTextDocument(document);
}

const extensionDir = () => {
	return vscode.extensions.getExtension('uozuaho.note-searcher')?.extensionPath;
};
