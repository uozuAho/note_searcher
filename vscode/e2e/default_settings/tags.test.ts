import { expect } from 'chai';

import { VsCodeDriver } from '../utils/VsCodeDriver';
import { NoteSearcherDriver } from '../utils/NoteSearcherDriver';
import { openDemoDirAndCloseAllEditors } from '../utils/pretest';

describe('tags', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  before(async () => {
    await openDemoDirAndCloseAllEditors();

    vscode = new VsCodeDriver();
    noteSearcher = new NoteSearcherDriver(vscode);
  });

  it('tags do what I want', async () => {
    const tag = await noteSearcher.findTagInSidebar('transport');
    expect(tag).not.to.be.null;

    await tag!.click();

    const trainsNoteSearchResult = await noteSearcher.findSearchResult('trains.md');
    expect(trainsNoteSearchResult).not.to.be.null;

    await trainsNoteSearchResult!.click();

    const trainsNoteEditor = await vscode.currentEditor();
    trainsNoteEditor.typeText('#new_tag');
  });
});
