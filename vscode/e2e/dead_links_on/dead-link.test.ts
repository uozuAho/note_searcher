import { expect } from 'chai';

import { VsCodeDriver } from '../utils/VsCodeDriver';
import { NoteSearcherDriver } from '../utils/NoteSearcherDriver';
import { openDemoDirAndCloseAllEditors } from '../utils/pretest';

describe('dead links', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  before(async () => {
    await openDemoDirAndCloseAllEditors();

    vscode = new VsCodeDriver();
    noteSearcher = new NoteSearcherDriver(vscode);
  });

  it('shows dead links on save', async () => {
    await vscode.openDemoDirFile('cheese.md');
    const editor = await vscode.getOnlyOpenEditor();

    await editor.typeText(6, 1, '[dead link](this/doesnt/exist.md)');
    await editor.save();

    const currentEditor = await vscode.currentEditor();
    expect(currentEditor).not.to.be.null;
    expect(await currentEditor!.getTitle()).not.to.contain('cheese');
    expect(await currentEditor!.getText()).to.contain('dead link to');
  });
});
