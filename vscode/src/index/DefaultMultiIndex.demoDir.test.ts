const _path = require('path');

import { createFileSystem } from "../utils/FileSystem";
import { DefaultMultiIndex } from "./DefaultMultiIndex";

const demoDir = _path.resolve(__dirname, '../../demo_dir');
const trainsPath = _path.resolve(demoDir, 'trains.md');
const readmePath = _path.resolve(demoDir, 'readme.md');
const cheesePath = _path.resolve(demoDir, 'cheese.md');
const aboutNodeModulesPath = _path.resolve(demoDir, 'node_modules/about_node_modules.md');
const ignoredFilePath = _path.resolve(demoDir, 'ignored_stuff/ignored_file.md');

describe('DefaultMultiIndex, demo dir, dead links', () => {
  let linkIndex: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    linkIndex = new DefaultMultiIndex(fs, demoDir);
  });

  it('finds all dead links in demo dir', async () => {
    await linkIndex.indexAllFiles(demoDir);

    // act
    const deadLinks = linkIndex.findAllDeadLinks();

    // assert
    expect(deadLinks).toHaveLength(4);
    expect(deadLinks.map(d => _path.parse(d.sourcePath).name))
      .toStrictEqual(['readme', 'readme', 'readme', 'readme']);

    expect(deadLinks.map(d => _path.parse(d.targetPath).name))
      .toStrictEqual(['nowhere', 'non_existent_note', 'ignored_file', 'about_node_modules']);
  });

  it('ignores dead links in ignored files', async () => {
    await linkIndex.indexAllFiles(demoDir);

    const deadLinkSourceNames = linkIndex.findAllDeadLinks()
      .map(l => l.sourcePath)
      .map(p => _path.parse(p).name);

    expect(deadLinkSourceNames).not.toContain('ignored_file');
  });

  it('includes links to ignored files', async () => {
    await linkIndex.indexAllFiles(demoDir);

    const deadLinksFromReadmeToIgnoredFile = linkIndex.findAllDeadLinks()
      .filter(l => l.sourcePath.includes('readme'))
      .filter(l => l.targetPath.includes('ignored_file'));

    expect(deadLinksFromReadmeToIgnoredFile.length).toBeGreaterThan(0);
  });
});

describe('DefaultMultiIndex, demo dir, tags', () => {
  let linkIndex: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    linkIndex = new DefaultMultiIndex(fs, demoDir);
  });

  it('contains transport', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.allTags()).toContain('transport');
  });

  it('ignores node_modules', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.allTags()).not.toContain('node_modules_ignored_tag');
  });

  it('ignores ignored directories', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.allTags()).not.toContain('ignored_tag');
  });
});

describe('DefaultMultiIndex, demo dir, containsNote', () => {
  let linkIndex: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    linkIndex = new DefaultMultiIndex(fs, demoDir);
  });

  it('contains trains', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.containsNote('trains')).toBe(true);
  });

  it('ignores node_modules', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.containsNote('about_node_modules')).toBe(false);
  });

  it('ignores ignored directories', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.containsNote('ignored_file')).toBe(false);
  });
});

describe('DefaultMultiIndex, demo dir, linksFrom', () => {
  let linkIndex: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    linkIndex = new DefaultMultiIndex(fs, demoDir);
  });

  it('train links to readme', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.linksFrom(trainsPath)).toStrictEqual([readmePath]);
  });

  it('ignores node_modules', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.linksFrom(aboutNodeModulesPath).length).toBe(0);
  });

  it('ignores ignored dirs', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.linksFrom(ignoredFilePath).length).toBe(0);
  });
});

describe('DefaultMultiIndex, demo dir, linksTo', () => {
  let linkIndex: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    linkIndex = new DefaultMultiIndex(fs, demoDir);
  });

  it('train links to readme', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.linksTo(readmePath)).toStrictEqual([trainsPath]);
  });

  it('ignores node_modules', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.linksTo(aboutNodeModulesPath).length).toBe(0);
  });

  it('ignores ignored dirs', async () => {
    await linkIndex.indexAllFiles(demoDir);

    expect(linkIndex.linksTo(ignoredFilePath).length).toBe(0);
  });
});

describe('DefaultMultiIndex, demo dir, search', () => {
  let linkIndex: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    linkIndex = new DefaultMultiIndex(fs, demoDir);
  });

  it('search for cheese finds cheese', async () => {
    await linkIndex.indexAllFiles(demoDir);

    const results = await linkIndex.search('cheese');

    expect(results).toContain(cheesePath);
  });

  it('ignores node_modules', async () => {
    await linkIndex.indexAllFiles(demoDir);

    const results = await linkIndex.search('9ad8gggg86eef9869d8a6deddd');

    expect(results).not.toContain(aboutNodeModulesPath);
  });

  it('ignores ignored dirs', async () => {
    await linkIndex.indexAllFiles(demoDir);

    const results = await linkIndex.search('9ad8e6c986eef9869d8a6deddd');

    expect(results).not.toContain(ignoredFilePath);
  });
});

describe('DefaultMultiIndex, demo dir, on modify ignored file', () => {
  let linkIndex: DefaultMultiIndex;

  beforeEach(async () => {
    const fs = createFileSystem();
    linkIndex = new DefaultMultiIndex(fs, demoDir);
    await linkIndex.indexAllFiles(demoDir);

    const ignoredText = await fs.readFileAsync(ignoredFilePath);
    await linkIndex.onFileModified(ignoredFilePath, ignoredText);
  });

  it('does not index ignored text', async () => {
    const results = await linkIndex.search('9ad8e6c986eef9869d8a6deddd');
    expect(results).toHaveLength(0);
  });

  it('does not index ignored links from', async () => {
    const results = await linkIndex.linksFrom(ignoredFilePath);
    expect(results).toHaveLength(0);
  });

  it('does not index ignored links to', async () => {
    const results = await linkIndex.linksTo(ignoredFilePath);
    expect(results).toHaveLength(0);
  });

  it('does not index dead links', async () => {
    const results = await linkIndex.findAllDeadLinks();
    expect(results.filter(r => r.sourcePath === ignoredFilePath)).toHaveLength(0);
  });

  it('does not index tags', async () => {
    const tags = await linkIndex.allTags();
    expect(tags.includes('ignored_tag')).toBe(false);
  });
});
