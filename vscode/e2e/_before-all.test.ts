import { VsCodeDriver } from './utils/VsCodeDriver';
import { NoteSearcherDriver } from './utils/NoteSearcherDriver';

let hasRun = false;

export const globalBeforeAll = async () => {
  if (hasRun) { return; }

  const vscode = new VsCodeDriver();
  const noteSearcher = new NoteSearcherDriver(vscode);

  await vscode.openDemoDirectory();
  await vscode.closeAllEditors();
  await noteSearcher.enable();

  hasRun = true;
};
