import { expect } from 'chai';

import { VsCodeDriver } from '../utils/VsCodeDriver';
import { NoteSearcherDriver } from '../utils/NoteSearcherDriver';
import { openDemoDirAndCloseAllEditors } from '../utils/pretest';
import { ContentAssist, TextEditor } from 'vscode-extension-tester';

describe('wikilinks', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  before(async () => {
    await openDemoDirAndCloseAllEditors();

    vscode = new VsCodeDriver();
    noteSearcher = new NoteSearcherDriver(vscode);
  });

  // looks like ctrl+clicking text isn't available in vscode-extension-tester,
  // so can't do this test :(
  it.skip('goes to wikilink on ctrl+click', async () => {
    await vscode.openDemoDirFile('subdir/my_sub_file.md');

    const editor = new TextEditor();
    await editor.moveCursor(4, 16);
    // I don't think content assist is what is needed here. Content assist
    // seems to be for autocompletion.
    const assist = await editor.toggleContentAssist(true) as ContentAssist;
    const cheeseMd = await assist.getItem('cheese.md');
    // it's undefined :(
    expect(cheeseMd).not.to.be.undefined;
    await cheeseMd!.click(); // this completes the text, doesn't do ctrl+click
                             // maybe not possible??
    const currentEditor = await vscode.currentEditor();
    expect(await currentEditor!.getTitle()).to.equal('cheese.md');
  });
});
