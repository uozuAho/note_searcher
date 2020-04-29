import { expect } from 'chai';

import { VsCodeDriver } from './utils/VsCodeDriver';
import { NoteSearcherDriver } from './utils/NoteSearcherDriver';

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

  // desired flow
  // enter 'new note' command
  // prompt for name, with id pre-filled
  // user completes name, presses enter
  // file is created in root dir
  // file is opened in a new editor

  it('opens note in new editor', async () => {
    await noteSearcher.initCreateNote();
    await vscode.isShowingInputBox();
    await vscode.enterInputText('my_note');
    const editor = await vscode.getOnlyOpenEditor();
    expect(await editor.isDisplayed()).to.be.true;
  });
});
