const fs = require ('fs');
const path = require ('path');

import { expect } from 'chai';

import { VsCodeDriver } from './utils/VsCodeDriver';
import { NoteSearcherDriver } from './utils/NoteSearcherDriver';
import { waitFor } from './utils/wait';

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
    const fileExists = await waitFor(() => fs.existsSync(expectedPath));
    expect(fileExists).to.be.true;
    await vscode.closeAllEditors();
    fs.unlinkSync(expectedPath);
  });
});
