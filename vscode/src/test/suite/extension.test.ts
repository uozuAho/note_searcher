import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', async () => {
  // this seems to break tests
  // const thisDir = vscode.Uri.file(path.join(__dirname, '..', '..'));
  // await vscode.commands.executeCommand('vscode.openFolder', thisDir);

  vscode.window.showInformationMessage('Start all tests.');

  // todo: needs to run in a dir, but opening dir breaks tests (see above)
  // test('build index', async () => {
  //   await vscode.commands.executeCommand('extension.index');
  // });
});
