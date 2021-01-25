const _path = require('path');

import { createFileSystem } from "../utils/FileSystem";
import { DefaultMultiIndex } from "./DefaultMultiIndex";

const demoDir = _path.resolve(__dirname, '../../demo_dir');

describe('DefaultMultiIndex, demo dir, dead links', () => {
  let linkIndex: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem({
      ignore: ['ignored_stuff']
    });
    linkIndex = new DefaultMultiIndex(fs);
  });

  it('finds all dead links in demo dir', async () => {
    await linkIndex.index(demoDir);

    // act
    const deadLinks = linkIndex.findAllDeadLinks();

    // assert
    expect(deadLinks).toHaveLength(3);
    expect(deadLinks.map(d => _path.parse(d.sourcePath).base))
      .toStrictEqual(['readme.md', 'readme.md', 'readme.md']);

    expect(deadLinks.map(d => _path.parse(d.targetPath).base))
      .toStrictEqual(['nowhere.md', 'non_existent_note', 'ignored_file']);
  });

  it('ignores dead links in ignored files', async () => {
    await linkIndex.index(demoDir);

    const deadLinkSourceNames = linkIndex.findAllDeadLinks()
      .map(l => l.sourcePath)
      .map(p => _path.parse(p).name);

    expect(deadLinkSourceNames).not.toContain('ignored_file');
  });

  it('includes links to ignored files', async () => {
    await linkIndex.index(demoDir);

    const deadLinksFromReadmeToIgnoredFile = linkIndex.findAllDeadLinks()
      .filter(l => l.sourcePath.includes('readme'))
      .filter(l => l.targetPath.includes('ignored_file'));

    expect(deadLinksFromReadmeToIgnoredFile.length).toBeGreaterThan(0);
  });
});
