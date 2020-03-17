import * as vscode from 'vscode';
import { newSearcher } from './search';

export function activate(context: vscode.ExtensionContext) {
	const searcher = newSearcher();

	let search = vscode.commands.registerCommand('extension.search', () => {
		vscode.window.showInputBox({
			prompt: "Search for documents"
		})
			.then(input => {
				if (input) {
					searcher.search(input)
						.then(result => console.log(result))
						.catch(reason => console.error(reason));
				}
			});
	});
	context.subscriptions.push(search);

	let index = vscode.commands.registerCommand('extension.index', () => {
		const folders = vscode.workspace.workspaceFolders;
		if (folders) {
			searcher.index(folders[0].uri.fsPath);
		}
	});
	context.subscriptions.push(index);
}

export function deactivate() {}
