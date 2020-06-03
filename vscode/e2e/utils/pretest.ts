import { VsCodeDriver } from './VsCodeDriver';
import { NoteSearcherDriver } from './NoteSearcherDriver';

let hasRun = false;

export const openDemoDirAndCloseAllEditors = async () => {
  if (hasRun) { return; }

  const vscode = new VsCodeDriver();
  const noteSearcher = new NoteSearcherDriver(vscode);

  await vscode.openDemoDirectory();

  // there seems to be a bug in the driver that causes stale element
  // exceptions when performing actions soon after opening a directory
  await sleep(500);

  await vscode.closeAllEditors();
  await noteSearcher.enable();

  hasRun = true;
};

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
