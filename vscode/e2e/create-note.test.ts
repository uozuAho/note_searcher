// chai used since jest conflicts with mocha,
// mocha is required by vscode-extension-tester
import { expect } from 'chai';

import { VsCodeDriver } from './utils/VsCodeDriver';
import { NoteSearcherDriver } from './utils/NoteSearcherDriver';

class NoteSearcherTestHarness {
  constructor(
    private vscode: VsCodeDriver,
    private noteSearcher: NoteSearcherDriver
  ) {}

  public openDemoDirectory = () => {
    // todo: move code here
  };

  public isShowingInputBox = async () => {
    expect(await this.vscode.isShowingInputBox()).to.be.true('is not showing input box');
  }
}

describe('create note', () => {
  let vscode: VsCodeDriver;
  let noteSearcher: NoteSearcherDriver;

  before(async () => {
    vscode = new VsCodeDriver();
    noteSearcher = new NoteSearcherDriver(vscode);
    await vscode.openDemoDirectory();
    await noteSearcher.enable();
  });

  // desired flow
  // enter 'new note' command
  // prompt for name, with id pre-filled
  // user completes name, presses enter
  // file is created in root dir
  // file is opened in a new editor

  it('opens input box when create note command is run', async () => {
    await noteSearcher.initCreateNote();
    // todo: nicer error message here. can't seem to catch webdriver timeout
    expect(await vscode.isShowingInputBox()).to.be.true;
  });
});
