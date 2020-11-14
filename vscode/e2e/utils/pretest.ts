import { VsCodeDriver } from './VsCodeDriver';

let isDemoDirOpen = false;

export const openDemoDirAndCloseAllEditors = async () => {
  const vscode = new VsCodeDriver();

  if (!isDemoDirOpen) {
    await vscode.openDemoDirectory();
    isDemoDirOpen = true;

    // there seems to be a bug in the driver that causes stale element
    // exceptions when performing actions soon after opening a directory
    await sleep(500);
  }

  await vscode.closeAllEditors();
};

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
