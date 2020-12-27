import { expect } from 'chai';

import { VsCodeDriver } from '../utils/VsCodeDriver';
import { NoteSearcherDriver } from '../utils/NoteSearcherDriver';
import { openDemoDirAndCloseAllEditors } from '../utils/pretest';

describe('backlinks', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  before(async () => {
    await openDemoDirAndCloseAllEditors();

    vscode = new VsCodeDriver();
    noteSearcher = new NoteSearcherDriver(vscode);
  });

  it('clicking on a backlink opens the backlink', async () => {
    await vscode.openDemoDirFile('trains.md');
    const backlink = await noteSearcher.findBacklinkByName('readme.md');
    expect(backlink).not.to.be.null;
    await backlink!.click();
    const currentEditor = await vscode.currentEditor();
    expect(await currentEditor!.getTitle()).to.equal('readme.md');
  });

  it('backlinks support markdown links', async () => {
    await vscode.openDemoDirFile('cheese.md');
    const backlink = await noteSearcher.findBacklinkByName('readme.md');
    expect(backlink).not.to.be.null;
    await backlink!.click();
    const currentEditor = await vscode.currentEditor();
    expect(await currentEditor!.getTitle()).to.equal('readme.md');
  });
});
