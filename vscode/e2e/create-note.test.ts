const fs = require ('fs');
const path = require ('path');

import { expect } from 'chai';

import { VsCodeDriver } from './utils/VsCodeDriver';
import { NoteSearcherDriver } from './utils/NoteSearcherDriver';

const checkWithTimeout = (check: () => boolean, timeoutMs = 1000) => {
  return new Promise((resolve, reject) => {
    let start = Date.now();

    const doCheck = () => {
      if (Date.now() - start > timeoutMs) { 
        reject('timed out');
      }
      if (!check()) {
        setTimeout(() => doCheck(), 100);
      } else {
        resolve(true);
      }
    };

    doCheck();
  });
};

describe('create note', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  before(async () => {
    vscode = new VsCodeDriver();
    noteSearcher = new NoteSearcherDriver(vscode);
    await vscode.openDemoDirectory();
    await vscode.closeAllEditors();
    await noteSearcher.enable();
  });

  it('opens note in new editor and saves to root directory', async () => {
    await noteSearcher.initCreateNote();
    await vscode.isShowingInputBox();
    await vscode.enterInputText('_my_note.md');
    const editor = await vscode.getOnlyOpenEditor();
    expect(await editor.isDisplayed()).to.be.true;
    const editorTitle = editor.getTitle();
    expect(editorTitle).to.match(/\d{12}_my_note/);
    await editor.save();
    const expectedPath = path.join(vscode.getDemoDirectory(), editorTitle);
    const fileExists = await checkWithTimeout(() => fs.existsSync(expectedPath));
    expect(fileExists).to.be.true;
    await vscode.closeAllEditors();
    fs.unlinkSync(expectedPath);
  });
});
