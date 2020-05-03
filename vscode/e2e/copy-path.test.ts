import * as clipboard from 'clipboardy';

import { expect } from 'chai';

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

  it('puts a markdown link to a search result in the clipboard', async () => {
    await noteSearcher.search('cheese');
    const cheeseFile = await noteSearcher.findSearchResult('cheese.md');
    await cheeseFile.clickContextMenuItem('Copy relative path');

    expect(await clipboard.read()).to.equal('[](cheese.md)');
  });
});
