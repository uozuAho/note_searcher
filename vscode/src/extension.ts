import * as path from 'path';
import * as vscode from 'vscode';
import { newCliSearcher, Searcher } from './search';
import * as vsutils from './vscode.utils';
import { DummyTreeData } from './dummyTreeData';

export function activate(context: vscode.ExtensionContext) {
	const searcher = newCliSearcher(path.join(extensionDir()!, 'out/note_searcher.jar'));

	let searchCmd = vscode.commands.registerCommand(
		'extension.search',
		async () => await search(searcher)
	);
	context.subscriptions.push(searchCmd);

	let indexCmd = vscode.commands.registerCommand(
		'extension.index',
		async () => await index(searcher)
	);
	context.subscriptions.push(indexCmd);
}

export function deactivate() {}

const extensionDir = () => {
	return vscode.extensions.getExtension('uozuaho.note-searcher')?.extensionPath;
};

const search = async (searcher: Searcher) => {
	const input = await vscode.window.showInputBox({
		prompt: "Search for documents"
	});
	if (!input) {
		return;
	}
	try {
		const folder = rootPath();
		if (!folder) { throw new Error('no!'); }
		const results = await searcher.search(input);
		vsutils.openInNewOutputChannel(results.map(r => r.fsPath).join('\n'));
		vscode.window.createTreeView('noteSearcher-results', {
			treeDataProvider: new DummyTreeData(folder)
		});
	}
	catch (e) {
		vsutils.openInNewEditor(e);
	}
};

const index = async (searcher: Searcher) => {
	const folder = rootPath();

	if (!folder) {
		vscode.window.showErrorMessage(
			'open a folder in vscode for indexing to work');
		return;
	}

	vscode.window.showInformationMessage('indexing current folder...');

	try {
		await searcher.index(folder);
		vscode.window.showInformationMessage('indexing complete');
	}
	catch (e) {
		vsutils.openInNewEditor(e);
	}
};

const rootPath = (): string | null =>
	vscode.workspace.workspaceFolders
	? vscode.workspace.workspaceFolders[0].uri.fsPath
	: null;
