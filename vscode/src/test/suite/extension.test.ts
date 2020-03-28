import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

suite('Extension Test Suite', async () => {
  // this seems to break tests
  // const thisDir = vscode.Uri.file(path.join(__dirname, '..', '..'));
  // await vscode.commands.executeCommand('vscode.openFolder', thisDir);

  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.equal(-1, [1, 2, 3].indexOf(5));
    assert.equal(-1, [1, 2, 3].indexOf(0));
  });

  test('build index', async () => {
    // todo: needs to run in a dir, but opening dir breaks tests (see above)
    await vscode.commands.executeCommand('extension.index');
  });
});
