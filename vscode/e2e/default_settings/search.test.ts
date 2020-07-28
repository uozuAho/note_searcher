// chai used since jest conflicts with mocha,
// mocha is required by vscode-extension-tester
import { expect } from 'chai';

import { VsCodeDriver } from '../utils/VsCodeDriver';
import { NoteSearcherDriver } from '../utils/NoteSearcherDriver';
import { openDemoDirAndCloseAllEditors } from '../utils/pretest';

describe('search', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  before(async () => {
    await openDemoDirAndCloseAllEditors();

    vscode = new VsCodeDriver();
    noteSearcher = new NoteSearcherDriver(vscode);
  });

  it('opens a file returned by a search', async () => {
    await noteSearcher.search('cheese');
    const cheeseFile = await noteSearcher.findSearchResult('cheese.md');
    if (!cheeseFile) { expect.fail('could not find cheese file in search results'); }
    await cheeseFile.click();

    const cheeseDoc = await vscode.findEditorByTitle(title => title === 'cheese.md');
    expect(cheeseDoc).not.to.be.null;

    // prevent crash, see https://github.com/redhat-developer/vscode-extension-tester/issues/122
    // remove when fix for above has been released (3.0.1?)
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  });
});
