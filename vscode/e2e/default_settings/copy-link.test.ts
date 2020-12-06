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
      if (!cheeseFile) { expect.fail('cheese file not in search results'); }

      await cheeseFile.clickContextMenuItem('Copy markdown link');

      expect(await clipboard.read()).to.equal('[](cheese.md)');
    });

    it('puts a wiki link to a search result in the clipboard', async () => {
      await noteSearcher.search('cheese');
      const cheeseFile = await noteSearcher.findSearchResult('cheese.md');
      if (!cheeseFile) { expect.fail('cheese file not in search results'); }

      await cheeseFile.clickContextMenuItem('Copy wiki link');

      expect(await clipboard.read()).to.equal('[[cheese]]');
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
      const editor = await vscode.currentEditor();
      if (!editor) { expect.fail('expected an editor to be open'); };

      const editorTab = await editor.getTab();
      const menu = await editorTab.openContextMenu();
      const menuItem = await menu.getItem('Note searcher: Copy markdown link');
      if (!menuItem) { expect.fail(`could not find 'copy markdown link' option`); }
      await menuItem.click();

      expect(await clipboard.read()).to.equal('[](cheese.md)');
    });

    it('puts a wiki link to a search result in the clipboard', async () => {
      await vscode.openDemoDirFile('cheese.md');
      const editor = await vscode.currentEditor();
      if (!editor) { expect.fail('expected an editor to be open'); };

      const editorTab = await editor.getTab();
      const menu = await editorTab.openContextMenu();
      const menuItem = await menu.getItem('Note searcher: Copy wiki link');
      if (!menuItem) { expect.fail(`could not find 'copy wiki link' option`); }
      await menuItem.click();

      expect(await clipboard.read()).to.equal('[[cheese]]');
    });
  });

  describe('from file explorer', () => {
    before(async () => {
      await openDemoDirAndCloseAllEditors();

      vscode = new VsCodeDriver();
      noteSearcher = new NoteSearcherDriver(vscode);
    });

    it('puts a wiki link to a search result in the clipboard', async () => {
      const cheeseFile = await vscode.findFileExplorerItem('cheese.md');
      if (!cheeseFile) { expect.fail('cheese file not found in explorer'); }

      await cheeseFile.clickContextMenuItem('Note searcher: Copy wiki link');

      expect(await clipboard.read()).to.equal('[[cheese]]');
    });
  });
});
