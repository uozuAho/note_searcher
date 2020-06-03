const fs = require('fs');
const path = require('path');

import { expect } from 'chai';

import { VsCodeDriver } from '../utils/VsCodeDriver';
import { NoteSearcherDriver } from '../utils/NoteSearcherDriver';
import { waitFor } from '../utils/wait';
import { openDemoDirAndCloseAllEditors } from '../_before-all.test';

describe('create note', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  describe('when no notes are open', () => {
    before(async () => {
      await openDemoDirAndCloseAllEditors();

      vscode = new VsCodeDriver();
      noteSearcher = new NoteSearcherDriver(vscode);
    });

    it('opens note in new editor and saves to the root directory', async () => {
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

  describe('when a note is open', () => {
    before(async () => {
      await openDemoDirAndCloseAllEditors();

      vscode = new VsCodeDriver();
      noteSearcher = new NoteSearcherDriver(vscode);
    });

    it('opens note in new editor and saves to the same directory as the current note', async () => {
      const subdir = path.join(vscode.getDemoDirectory(), 'subdir');
      const openedFile = path.join(subdir, 'my_sub_file.md');
      await vscode.openFile(openedFile);
      await sleep(500);
      await noteSearcher.initCreateNote();
      await vscode.enterInputText('_my_note.md');
      const editor = await vscode.findEditorByTitle(t => t.includes('_my_note'));
      expect(editor).not.to.be.null;
      const editorTitle = editor!.getTitle();
      await editor!.save();
      const expectedPath = path.join(subdir, editorTitle);
      const fileExists = await waitFor(() => fs.existsSync(expectedPath), 1000,
        `timed out waiting for file '${expectedPath}'`);
      expect(fileExists).to.be.true;
      await vscode.closeAllEditors();
      fs.unlinkSync(expectedPath);
    });
  });
});

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
