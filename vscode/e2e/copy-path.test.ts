import { expect } from 'chai';
import * as clipboard from 'clipboardy';

import { VsCodeDriver } from './utils/VsCodeDriver';
import { NoteSearcherDriver } from './utils/NoteSearcherDriver';
import { globalBeforeAll } from './_before-all.test';

describe('copy note path', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  before(async () => {
    await globalBeforeAll();

    vscode = new VsCodeDriver();
    noteSearcher = new NoteSearcherDriver(vscode);
  });

  it('copies the link to a search result to a new editor', async () => {
    await noteSearcher.search('cheese');
    const cheeseFile = await noteSearcher.findSearchResult('cheese.md');
    expect(cheeseFile).not.to.be.undefined;

    const menu = await cheeseFile!.openContextMenu();
    const copyPath = await menu.getItem('Copy relative path');
    if (!copyPath) { expect.fail('could not find "copy path" menu item'); }
    await copyPath.click();

    expect(await clipboard.read()).to.equal('[](cheese.md)');
  });
});
