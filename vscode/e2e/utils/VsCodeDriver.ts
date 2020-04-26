import {
  Workbench,
  VSBrowser,
  InputBox,
  EditorView
} from 'vscode-extension-tester';

export class VsCodeDriver {

  constructor(
    private driver = VSBrowser.instance.driver,
    private workbench = new Workbench()
  ) { }

  public openDirectory = async (dir: string) => {
    await this.workbench.executeCommand('Extest: Open Folder');
    const input = await InputBox.create();
    await input.setText(dir);
    await input.confirm();
  };

  public runCommand = (command: string) => {
    return this.workbench.executeCommand(command);
  };

  public findEditor = async (editorTitle: string) => {
    const editorView = new EditorView();
    // Was getting 'no editor found with title X' errors here without the delay.
    // There is a noticeable delay after the file is clicked on before the
    // editor opens.
    const found = await this.driver.wait(async () => {
      const titles = await editorView.getOpenEditorTitles();
      for (const title of titles) {
        if (title === editorTitle) {
          return true;
        }
      }
    }, 2000);
    return found ? editorView.openEditor(editorTitle) : null;
  };
}
