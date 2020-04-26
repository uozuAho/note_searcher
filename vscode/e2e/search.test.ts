const path = require('path');

// chai used since jest conflicts with mocha,
// mocha is required by vscode-extension-tester
import { expect } from 'chai';

import { VsCodeDriver } from './utils/VsCodeDriver';
import { NoteSearcherDriver } from './utils/NoteSearcherDriver';

describe('search', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  before(async () => {
    vscode = new VsCodeDriver();
    noteSearcher = new NoteSearcherDriver(vscode);
    await vscode.openDirectory(path.resolve(__dirname, '../demo_dir'));
  });

  it('open a file returned by a search', async () => {
    await noteSearcher.enable();
    await noteSearcher.search('cheese');
    const cheeseFile = await noteSearcher.findSearchResult('cheese.md');
    expect(cheeseFile).not.to.be.undefined;
    await cheeseFile!.click();

    const cheeseDoc = await vscode.findEditor('cheese.md');
    expect(cheeseDoc).not.to.be.null;
  });
});
