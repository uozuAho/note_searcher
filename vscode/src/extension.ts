import * as path from 'path';
import * as vscode from 'vscode';
import { newCliSearcher } from './search';

export function activate(context: vscode.ExtensionContext) {
	const searcher = newCliSearcher(path.join(extensionDir()!, 'out/note_searcher.jar'));

	let search = vscode.commands.registerCommand('extension.search', () => {
		vscode.window.showInformationMessage(extensionDir()!);

		vscode.window.showInputBox({
			prompt: "Search for documents"
		})
			.then(input => {
				if (input) {
					// const output = vscode.window.createOutputChannel('note searcher');
					// output.show();
					searcher.search(input)
						.then(result => openInUntitled(result))
						.catch(reason => openInUntitled(reason));
				}
			});
	});
	context.subscriptions.push(search);

	let index = vscode.commands.registerCommand('extension.index', () => {
		const dev = process.env.NOTE_SEARCHER_DEV;
		vscode.window.showInformationMessage(dev ? dev : 'not dev mode');
		const folders = vscode.workspace.workspaceFolders;
		// const output = vscode.window.createOutputChannel('note searcher');
		// output.show();
		if (folders) {
			vscode.window.showInformationMessage('indexing current folder...');
			searcher.index(folders[0].uri.fsPath)
				.then(msg => {
					openInUntitled('indexing complete. msg: ' + msg);
				})
				.catch(reason => {
					console.log(reason);
					openInUntitled(reason);
				});
		} else {
			vscode.window.showErrorMessage(
				'open a folder in vscode for indexing to work');
		}
	});
	context.subscriptions.push(index);
}

export function deactivate() {}

async function openInUntitled(content: string, language?: string) {
    const document = await vscode.workspace.openTextDocument({
        language,
        content,
    });
    return await vscode.window.showTextDocument(document);
}

const extensionDir = () => {
	return vscode.extensions.getExtension('uozuaho.note-searcher')?.extensionPath;
};
