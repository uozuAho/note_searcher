const _path = require('path');

import { LunrNoteIndex } from "./lunrNoteIndex";
import { createFileSystem } from "../utils/FileSystem";

describe('MapLinkIndex, ignore, real filesystem', () => {
  let linkIndex: LunrNoteIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    linkIndex = new LunrNoteIndex(fs);
  });

  it('ignores files in ignored_stuff', async () => {
    await linkIndex.index(_path.resolve(__dirname, '../../demo_dir'));

    const all_note_names = Array
      .from(linkIndex.notes())
      .map(f => _path.parse(f).name);

    expect(all_note_names).not.toContain('ignored_file');
  });

  // todo:
  // ignores node_modules
  // linkIndex.allTags(); // does not contain #ignored_tags
  // linkIndex.findAllDeadLinks(); // does not contain dead link in ignore file
  //                               // contains link to ignored dir
  // linkIndex.search('9ad8e6c986eef9869d8a6deddd'); // returns nothing
});
