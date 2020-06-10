import { VsCodeDriver } from './VsCodeDriver';
import { NoteSearcherDriver } from './NoteSearcherDriver';

let isDemoDirOpen = false;

export const openDemoDirAndCloseAllEditors = async () => {
  const vscode = new VsCodeDriver();
  const noteSearcher = new NoteSearcherDriver(vscode);

  if (!isDemoDirOpen) {
    await vscode.openDemoDirectory();
    isDemoDirOpen = true;

    // there seems to be a bug in the driver that causes stale element
    // exceptions when performing actions soon after opening a directory
    await sleep(500);
  }

  await vscode.closeAllEditors();
  await noteSearcher.enable();
};

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
