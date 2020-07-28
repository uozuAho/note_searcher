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
    if (tag === null) { expect.fail('tags should be displayed from startup'); }

    // search for rubbish to ensure the search results are empty
    await noteSearcher.search('laksdjflkajsdfkl');

    await tag!.click();
    const trainsNoteSearchResult = await noteSearcher.findSearchResult('trains.md');
    if (trainsNoteSearchResult === null) { expect.fail('clicking on tag should search for that tag'); }

    await trainsNoteSearchResult!.click();

    const trainsNoteEditor = await vscode.currentEditor();
    if (!trainsNoteEditor) { expect.fail('expected train note to be open'); }
    await trainsNoteEditor.typeText(1, 1, '#new-tag ');
    await trainsNoteEditor.save();

    const newTag = await noteSearcher.findTagInSidebar('new-tag');
    if (!newTag) { expect.fail('new tags should appear on save'); }
  });
});
