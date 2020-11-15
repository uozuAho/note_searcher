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

  it('shows existing dead links', async () => {
    expect(await noteSearcher.isShowingInDeadLinks('readme.md')).to.be.true;
    expect(await noteSearcher.isShowingInDeadLinks('to/nowhere')).to.be.true;
  });

  it('shows new dead link on save', async () => {
    await vscode.openDemoDirFile('cheese.md');
    const editor = await vscode.currentEditor();
    if (!editor) { expect.fail('expected an editor to be open'); };

    await editor.typeText(6, 1, '[dead link](this/doesnt/exist.md)');
    await editor.save();

    expect(await noteSearcher.isShowingInDeadLinks('cheese.md')).to.be.true;
    expect(await noteSearcher.isShowingInDeadLinks('this/doesnt/exist.md')).to.be.true;
  });
});
