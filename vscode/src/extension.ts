import * as vscode from 'vscode';
import { newSearcher } from './search';

export function activate(context: vscode.ExtensionContext) {
	const searcher = newSearcher();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		searcher.search('stuff')
			.then(result => console.log(result))
			.catch(reason => console.error(reason));
		vscode.window.showInformationMessage('Hello snrub!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
