const path = require('path');

import * as clipboard from 'clipboardy';

import { expect } from 'chai';

import { VsCodeDriver } from '../utils/VsCodeDriver';
import { NoteSearcherDriver } from '../utils/NoteSearcherDriver';
import { openDemoDirAndCloseAllEditors } from '../utils/pretest';

describe('copy link to note', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  describe('from search results', () => {
    before(async () => {
      await openDemoDirAndCloseAllEditors();

      vscode = new VsCodeDriver();
      noteSearcher = new NoteSearcherDriver(vscode);
    });

    it('puts a markdown link to a search result in the clipboard', async () => {
      await noteSearcher.search('cheese');
      const cheeseFile = await noteSearcher.findSearchResult('cheese.md');
      await cheeseFile.clickContextMenuItem('Copy link');

      expect(await clipboard.read()).to.equal('[](cheese.md)');
    });
  });

  describe('from editor tab', () => {
    before(async () => {
      await openDemoDirAndCloseAllEditors();

      vscode = new VsCodeDriver();
      noteSearcher = new NoteSearcherDriver(vscode);
    });

    it('puts a markdown link to a search result in the clipboard', async () => {
      await vscode.openDemoDirFile('cheese.md');
      const editor = await vscode.getOnlyOpenEditor();

      const editorTab = await editor.getTab();
      const menu = await editorTab.openContextMenu();
      const menuItem = await menu.getItem('Note searcher: Copy link');
      if (!menuItem) { expect.fail(`could not find 'copy link' option`); }
      await menuItem.click();

      expect(await clipboard.read()).to.equal('[](cheese.md)');
    });
  });
});
