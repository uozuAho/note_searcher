const path = require('path');

import {
  Workbench,
  WebDriver,
  VSBrowser,
  Notification,
  InputBox,
  ActivityBar,
  CustomTreeSection
} from 'vscode-extension-tester';

import { expect } from 'chai';

async function notificationExists(text: string): Promise<Notification | undefined> {
  const notifications = await new Workbench().getNotifications();
  for (const notification of notifications) {
    const message = await notification.getMessage();
    if (message.indexOf(text) >= 0) {
      return notification as any;
    }
  }
}

describe('search', () => {
  let driver: WebDriver;

  before(() => {
    driver = VSBrowser.instance.driver;
  });

  it('search', async () => {
    // open dir
    const workbench = new Workbench();
    await workbench.executeCommand('Extest: Open Folder');
    const folder = path.resolve(__dirname, '../demo_dir');
    const input1 = await InputBox.create();
    await input1.setText(folder);
    await input1.confirm();

    // enable note searcher
    await workbench.executeCommand('Note searcher: enable in this directory');

    // get note searcher sidebar
    const activityBar = new ActivityBar();
    const controls = activityBar.getViewControl('Note Searcher');
    const sideBar = await controls.openView();

    // search for cheese
    await workbench.executeCommand('Note searcher: search for docs');
    const input2 = await InputBox.create();
    await input2.setText('cheese');
    await input2.confirm();

    // get results
    const searchResults = await sideBar.getContent()
      .getSection('Search results') as CustomTreeSection;

    const cheeseFile = await searchResults.findItem('cheese.md');
    expect(cheeseFile).not.to.be.undefined;
    // todo: tsconfig is a bit wacky for these tests
    await cheeseFile!.click();

    // expect(await notification.getMessage()).to.equal('Hello World!');
    // expect(await notification.getType()).to.equal(NotificationType.Info);
  });
});
