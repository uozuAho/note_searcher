import * as path from 'path';
import * as vscode from 'vscode';
import { newCliSearcher } from './search';

export function activate(context: vscode.ExtensionContext) {
	const searcher = newCliSearcher(path.join(extensionDir()!, 'out/note_searcher.jar'));

	let search = vscode.commands.registerCommand('extension.search', () => {
		vscode.window.showInputBox({
			prompt: "Search for documents"
		}).then(input => {
			if (input) {
				searcher.search(input)
					.then(result => openInNewEditor(result))
					.catch(reason => openInNewEditor(reason));
			}
		});
	});
	context.subscriptions.push(search);

	let index = vscode.commands.registerCommand('extension.index', () => {
		const folders = vscode.workspace.workspaceFolders;
		if (folders) {
			vscode.window.showInformationMessage('indexing current folder...');
			searcher.index(folders[0].uri.fsPath)
				.then(() => {
					vscode.window.showInformationMessage('indexing complete');
				})
				.catch(reason => {
					openInNewEditor(reason);
				});
		} else {
			vscode.window.showErrorMessage(
				'open a folder in vscode for indexing to work');
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
