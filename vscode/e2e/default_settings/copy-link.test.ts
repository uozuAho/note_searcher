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

    // todo: how to open an editor tab's context menu?
    // check for answer: https://github.com/redhat-developer/vscode-extension-tester/issues/118
    it.skip('puts a markdown link to a search result in the clipboard', async () => {
      await vscode.openDemoDirFile('cheese.md');
      const editor = await vscode.getOnlyOpenEditor();

      const menu = await editor.openContextMenu();

      expect(await clipboard.read()).to.equal('[](cheese.md)');
    });
  });
});
